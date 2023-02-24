/**
 * Copyright 2019 Ironbelly Devs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import BigNumber from 'bignumber.js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import { combineReducers } from 'redux'
import RNFS from 'react-native-fs'
import { persistReducer } from 'redux-persist'
import {
  ADDRESS_TRANSPORT_METHOD,
  getConfigForRust,
  mapRustTx,
  mapRustOutputStrategy,
  getSlatePath,
} from 'src/common'
import { log } from 'src/common/logger'
import {
  RustTx,
  Tx,
  Action,
  Store,
  Slate,
  txCancelRequestAction,
  txListRequestAction,
  txCreateRequestAction,
  txSendAddressRequestAction,
  txPostRequestAction,
  txReceiveRequestAction,
  txFinalizeRequestAction,
  slateSetRequestAction,
  slateRemoveRequestAction,
  txPostCloseAction,
  txGetRequestAction,
  txFormOutputStrategiesRequestAction,
  OutputStrategy,
  Error as AppError,
} from 'src/common/types'
import { getNavigation } from './navigation'
import { RootState } from 'src/common/redux'
import WalletBridge from 'src/bridges/wallet'

export type ListState = {
  data: Array<Tx>;
  inProgress: boolean;
  isOffline: boolean;
  refreshFromNode: boolean;
  showLoader: boolean;
  lastUpdated: moment.Moment | undefined | null;
  error: AppError | undefined | null;
};
export type TxCreateState = {
  data: Tx | undefined | null;
  created: boolean;
  inProgress: boolean;
  error: AppError | undefined | null;
};
export type TxSendState = {
  data: Tx | undefined | null;
  sent: boolean;
  inProgress: boolean;
  error: AppError | undefined | null;
};
export type TxPostState = {
  txSlateId: string | undefined | null;
  showModal: boolean;
  posted: boolean;
  inProgress: boolean;
  error: AppError | undefined | null;
};
export type TxGetState = {
  data: Tx | undefined | null;
  isRefreshed: boolean;
  inProgress: boolean;
  error: AppError | undefined | null;
};
export type TxReceiveState = {
  data: Tx | undefined | null;
  received: boolean;
  inProgress: boolean;
  error: AppError | undefined | null;
};
export type TxFinalizeState = {
  data: Tx | undefined | null;
  finalized: boolean;
  inProgress: boolean;
  error: AppError | undefined | null;
};
export type TxCancelState = {
  data: Tx | undefined | null;
  inProgress: boolean;
  error: AppError | undefined | null;
};
export type TxForm = {
  amount: number;
  outputStrategy: OutputStrategy | undefined | null;
  outputStrategies: Array<OutputStrategy>;
  outputStrategies_error: string;
  outputStrategies_inProgress: boolean;
  textAmount: string;
  message: string;
  address: string;
};
export type SlateShareState = {
  inProgress: boolean;
};
export type SlateState = {
  data: Slate | undefined | null;
  inProgress: boolean;
  error: AppError | undefined | null;
};
export type State = Readonly<{
  list: ListState;
  txCreate: TxCreateState;
  txSend: TxSendState;
  txGet: TxGetState;
  txPost: TxPostState;
  txCancel: TxCancelState;
  txReceive: TxReceiveState;
  txFinalize: TxFinalizeState;
  txForm: TxForm;
  slate: SlateState;
  slateShare: SlateShareState;
}>;
const initialState: State = {
  list: {
    data: [],
    inProgress: false,
    showLoader: false,
    isOffline: false,
    refreshFromNode: false,
    lastUpdated: null,
    error: null,
  },
  txCreate: {
    data: null,
    created: false,
    inProgress: false,
    error: null,
  },
  txSend: {
    data: null,
    sent: false,
    inProgress: false,
    error: null,
  },
  txPost: {
    txSlateId: null,
    posted: false,
    showModal: false,
    inProgress: false,
    error: null,
  },
  txGet: {
    data: null,
    isRefreshed: false,
    inProgress: false,
    error: null,
  },
  txReceive: {
    data: null,
    received: false,
    inProgress: false,
    error: null,
  },
  txFinalize: {
    data: null,
    finalized: false,
    inProgress: false,
    error: null,
  },
  txCancel: {
    data: null,
    inProgress: false,
    error: null,
  },
  txForm: {
    amount: 0,
    outputStrategy: null,
    outputStrategies: [],
    outputStrategies_error: '',
    outputStrategies_inProgress: false,
    textAmount: '',
    message: '',
    address: '',
  },
  slate: {
    data: null,
    inProgress: false,
    error: null,
  },
  slateShare: {
    inProgress: false,
  },
}

function twoStringArrayEqual<T>(a: T[], b: T[]) {
  return (a || []).join('') === (b || []).join('')
}

async function getArrayFromStorage(key: string) {
  const raw = await AsyncStorage.getItem(key)
  if (!raw) {
    return []
  }
  return JSON.parse(raw)
}

// Catching received transaction
function filterReceivedUnconfirmed(tx: Tx) {
  return !tx.confirmed && tx.type === 'TxReceived'
}

export const sideEffects = {
  ['TX_LIST_REQUEST']: async (action: txListRequestAction, store: Store) => {
    try {
      const finalized = await getArrayFromStorage('@finalizedTxs')
      const newFinalized: string[] = []

      const posted = await getArrayFromStorage('@postedTxs')
      const newPosted: string[] = []

      const received = await getArrayFromStorage('@receivedTxs')
      const newReceived: string[] = []

      const data = await WalletBridge.txsGet(
        getConfigForRust(store.getState()).minimum_confirmations,
        action.refreshFromNode,
      ).then(JSON.parse)
      let mappedData = data[1]
        .filter((tx: RustTx) => tx.tx_type.indexOf('Cancelled') === -1)
        .map((tx: RustTx) => {
          let pos = finalized.indexOf(tx.tx_slate_id)

          if (pos !== -1) {
            if (tx.confirmed) {
              return tx
            } else if (tx.tx_slate_id) {
              newFinalized.push(tx.tx_slate_id)
              return { ...tx, tx_type: 'TxFinalized' }
            }
          }

          pos = posted.indexOf(tx.tx_slate_id)

          if (pos !== -1) {
            if (tx.confirmed) {
              return tx
            } else if (tx.tx_slate_id) {
              newPosted.push(tx.tx_slate_id)
              return { ...tx, tx_type: 'TxPosted' }
            }
          }

          pos = received.indexOf(tx.tx_slate_id)

          if (pos !== -1 && !tx.confirmed && tx.tx_slate_id) {
            newReceived.push(tx.tx_slate_id)
          }

          return tx
        })
      // TODO: This horrible parody of atomic changes should be rewritten in a proper way
      if (
        twoStringArrayEqual(received, await getArrayFromStorage('@receivedTxs'))
      ) {
        await AsyncStorage.setItem('@receivedTxs', JSON.stringify(newReceived))
      }
      if (
        twoStringArrayEqual(
          finalized,
          await getArrayFromStorage('@finalizedTxs'),
        )
      ) {
        await AsyncStorage.setItem(
          '@finalizedTxs',
          JSON.stringify(newFinalized),
        )
      }
      if (
        twoStringArrayEqual(posted, await getArrayFromStorage('@postedTxs'))
      ) {
        await AsyncStorage.setItem('@postedTxs', JSON.stringify(newPosted))
      }

      mappedData = mappedData.map(mapRustTx)

      if (
        mappedData.filter(filterReceivedUnconfirmed).length >
        store.getState().tx.list.data.filter(filterReceivedUnconfirmed).length
      ) {
        store.dispatch({
          type: 'TOAST_SHOW',
          text: 'Transaction has been received',
        })
      }
      store.dispatch({
        type: 'TX_LIST_SUCCESS',
        data: mappedData,
        isRefreshed: data[0],
        balance: data[2],
      })
    } catch (e) {
      store.dispatch({
        type: 'TX_LIST_FAILURE',
        message: e.message,
      })
      log(e, true)
    }
  },
  ['TX_CANCEL_REQUEST']: (action: txCancelRequestAction, store: Store) => {
    return WalletBridge.txCancel(action.id)
      .then(() => {
        store.dispatch({
          type: 'TX_CANCEL_SUCCESS',
        })
        store.dispatch({
          type: 'SLATE_REMOVE_REQUEST',
          id: action.slateId,
          isResponse: action.isResponse,
        })
        store.dispatch({
          type: 'TX_LIST_REQUEST',
          showLoader: false,
          refreshFromNode: false,
        })
      })
      .catch(error => {
        const e = JSON.parse(error.message)
        store.dispatch({
          type: 'TX_CANCEL_FAILURE',
          code: 1,
          message: error,
        })
        log(e, true)
      })
  },
  ['TX_GET_REQUEST']: async (action: txGetRequestAction, store: Store) => {
    return WalletBridge.txGet(true, action.txSlateId)
      .then((json: string) => JSON.parse(json))
      .then(result => {
        store.dispatch({
          type: 'TX_GET_SUCCESS',
          isRefreshed: result[0],
          tx: result[1][0],
        })
      })
      .catch(error => {
        const e = JSON.parse(error.message)
        store.dispatch({
          type: 'TX_GET_FAILURE',
          code: 1,
          message: error,
        })
        log(e, true)
      })
  },
  ['TX_CREATE_REQUEST']: async (
    action: txCreateRequestAction,
    store: Store,
  ) => {
    try {
      const jsonResponse = await WalletBridge.txCreate(
        action.amount,
        getConfigForRust(store.getState()).minimum_confirmations,
        action.selectionStrategyIsUseAll,
      )
      const [[rustTx], slatepack] = JSON.parse(jsonResponse)
      const tx = mapRustTx(rustTx)
      store.dispatch({
        type: 'TX_CREATE_SUCCESS',
      })
      if (tx.slateId) {
        store.dispatch({
          type: 'SLATE_SET_REQUEST',
          id: tx.slateId,
          slatepack,
          isResponse: false,
        })
      }

      const navigation = await getNavigation()
      navigation?.navigate('TxIncompleteSend', { tx })

      store.dispatch({
        type: 'TX_LIST_REQUEST',
        showLoader: false,
        refreshFromNode: false,
      })
    } catch (error) {
      store.dispatch({
        type: 'TX_CREATE_FAILURE',
        message: error.message,
      })
      log(error, true)
    }
  },
  ['TX_SEND_ADDRESS_REQUEST']: async (
    action: txSendAddressRequestAction,
    store: Store,
  ) => {
    try {
      const finalized = await getArrayFromStorage('@finalizedTxs')
      const slateId = await WalletBridge.txSendAddress(
        action.amount,
        getConfigForRust(store.getState()).minimum_confirmations,
        action.selectionStrategyIsUseAll,
        action.address,
      ).then(JSON.parse)
      finalized.push(slateId)
      await AsyncStorage.setItem('@finalizedTxs', JSON.stringify(finalized))
      store.dispatch({
        type: 'TX_SEND_ADDRESS_SUCCESS',
      })
      const navigation = await getNavigation()
      navigation?.goBack()

      store.dispatch({
        type: 'TX_POST_SHOW',
        txSlateId: slateId,
      })
    } catch (e) {
      if (e.message.indexOf('HostUnreachable') !== -1) {
        store.dispatch({
          type: 'TX_CREATE_REQUEST',
          amount: action.amount,
          selectionStrategyIsUseAll: action.selectionStrategyIsUseAll,
        })
      } else {
        store.dispatch({
          type: 'TX_SEND_ADDRESS_FAILURE',
          message: e.message,
        })
        log(e, true)
      }
    }
  },
  ['TX_POST_REQUEST']: async (action: txPostRequestAction, store: Store) => {
    try {
      const finalized = await getArrayFromStorage('@finalizedTxs')
      const posted = await getArrayFromStorage('@postedTxs')
      await WalletBridge.txPost(action.txSlateId)
      posted.push(action.txSlateId)
      const pos = finalized.indexOf(action.txSlateId)

      if (pos !== -1) {
        finalized.splice(pos, 1)
      }

      await AsyncStorage.setItem('@finalizedTxs', JSON.stringify(finalized))
      await AsyncStorage.setItem('@postedTxs', JSON.stringify(posted))
      store.dispatch({
        type: 'TX_POST_SUCCESS',
      })
      setTimeout(() => {
        store.dispatch({
          type: 'TX_POST_CLOSE',
        })
      }, 3000)
    } catch (e) {
      store.dispatch({
        type: 'TX_POST_FAILURE',
        message: e.message,
      })
      log(e, true)
    }
  },
  ['TX_POST_CLOSE']: async (_action: txPostCloseAction, store: Store) => {
    store.dispatch({
      type: 'TX_LIST_REQUEST',
      showLoader: false,
      refreshFromNode: false,
    })
  },
  ['TX_RECEIVE_REQUEST']: async (
    action: txReceiveRequestAction,
    store: Store,
  ) => {
    try {
      const received = await getArrayFromStorage('@receivedTxs')
      const [[rustTx], slatepack] = await WalletBridge.txReceive(
        getConfigForRust(store.getState()).account,
        action.slatepack,
      ).then((json: string) => JSON.parse(json))
      const tx = mapRustTx(rustTx)
      received.push(tx.slateId)
      await AsyncStorage.setItem('@receivedTxs', JSON.stringify(received))

      store.dispatch({
        type: 'TX_RECEIVE_SUCCESS',
      })
      if (tx.slateId) {
        store.dispatch({
          type: 'SLATE_SET_REQUEST',
          id: tx.slateId,
          slatepack,
          isResponse: true,
        })
      }

      const navigation = await getNavigation()
      navigation?.navigate('TxIncompleteReceive', { tx })

      store.dispatch({
        type: 'TX_LIST_REQUEST',
        showLoader: false,
        refreshFromNode: false,
      })
    } catch (e) {
      store.dispatch({
        type: 'TX_RECEIVE_FAILURE',
        message: e.message,
      })
      log(e, true)
    }
  },
  ['TX_FINALIZE_REQUEST']: async (
    action: txFinalizeRequestAction,
    store: Store,
  ) => {
    try {
      const finalized = await getArrayFromStorage('@finalizedTxs')

      try {
        const [rustTx] = await WalletBridge.txFinalize(action.slatepack).then(
          JSON.parse,
        )
        // this hack is needed until TxFinalized is not natively supported
        const tx = mapRustTx({ ...rustTx, tx_type: 'TxFinalized' })
        store.dispatch({
          type: 'TX_FINALIZE_SUCCESS',
        })

        finalized.push(tx.slateId)
        await AsyncStorage.setItem('@finalizedTxs', JSON.stringify(finalized))

        const navigation = await getNavigation()
        navigation?.navigate('Overview')

        if (tx.slateId) {
          store.dispatch({
            type: 'TX_POST_SHOW',
            txSlateId: tx.slateId,
          })
        }
      } catch (e) {
        console.log(e.message)
        if (
          e.message.indexOf(
            'LibWallet Error: Wallet store error: DB Not Found Error: Slate id: ',
          ) !== -1
        ) {
          log(
            {
              message:
                'Slate has been already finalized. You only need to confirm it now',
            },
            true,
          )
        } else {
          throw e
        }
      }
    } catch (e) {
      store.dispatch({
        type: 'TX_FINALIZE_FAILURE',
        message: e.message,
      })
      log(e, true)
    }
  },
  ['SLATE_SET_REQUEST']: (action: slateSetRequestAction, store: Store) => {
    const path = getSlatePath(action.id, action.isResponse)
    return RNFS.writeFile(path, action.slatepack, 'utf8')
      .then(() => {
        store.dispatch({
          type: 'SLATE_SET_SUCCESS',
        })
      })
      .catch(error => {
        store.dispatch({
          type: 'SLATE_SET_FAILURE',
          code: 1,
          message: error.message,
        })
        log(error, true)
      })
  },
  ['SLATE_REMOVE_REQUEST']: async (
    action: slateRemoveRequestAction,
    store: Store,
  ) => {
    const path = getSlatePath(action.id, action.isResponse)

    if (await RNFS.exists(path)) {
      return RNFS.unlink(path)
        .then(() => {
          store.dispatch({
            type: 'SLATE_REMOVE_SUCCESS',
          })
        })
        .catch(error => {
          store.dispatch({
            type: 'SLATE_REMOVE_FAILURE',
            code: 1,
            message: error.message,
          })
          log(error, true)
        })
    } else {
      store.dispatch({
        type: 'SLATE_REMOVE_SUCCESS',
      })
    }
  },
  ['TX_FORM_OUTPUT_STRATEGIES_REQUEST']: (
    action: txFormOutputStrategiesRequestAction,
    store: Store,
  ) => {
    return WalletBridge.txStrategies(
      action.amount,
      getConfigForRust(store.getState()).minimum_confirmations,
    )
      .then((json: string) => JSON.parse(json))
      .then(outputStrategies => {
        if (!outputStrategies.length) {
          throw new Error('Not enough funds')
        }
        console.log({ outputStrategies })
        store.dispatch({
          type: 'TX_FORM_OUTPUT_STRATEGIES_SUCCESS',
          // strategy with selection_strategy_is_use_all === true is always less favorable:
          // it costs more and lock all the funds if picked
          // TODO: fix it in the rust codebase
          outputStrategies: outputStrategies.filter(
            oS => !oS.selection_strategy_is_use_all,
          ),
        })
      })
      .catch((error: Error) => {
        store.dispatch({
          type: 'TX_FORM_OUTPUT_STRATEGIES_FAILURE',
          code: 1,
          message: error.message,
        })
      })
  },
}

const list = function (
  state: ListState = initialState.list,
  action: Action,
): ListState {
  switch (action.type) {
    case 'TX_LIST_CLEAR':
      return { ...state, data: [] }

    case 'TX_LIST_REQUEST':
      return {
        ...state,
        inProgress: true,
        refreshFromNode: action.refreshFromNode,
        showLoader: action.showLoader,
        error: null,
      }

    case 'TX_LIST_SUCCESS': {
      const txs: Tx[] = action.data.slice(0)
      txs.sort(function (a, b) {
        return (
          new Date(b.creationTime).getTime() -
          new Date(a.creationTime).getTime()
        )
      })
      return {
        ...state,
        data: txs,
        showLoader: false,
        refreshFromNode: false,
        isOffline: state.refreshFromNode && !action.isRefreshed,
        lastUpdated: moment(),
        inProgress: false,
      }
    }

    case 'TX_LIST_FAILURE':
      return {
        ...state,
        error: {
          code: action.code,
          message: action.message,
        },
        isOffline: false,
        refreshFromNode: false,
        showLoader: false,
        inProgress: false,
        lastUpdated: moment(),
      }

    default:
      return state
  }
}

const txCreate = function (
  state: TxCreateState = initialState.txCreate,
  action: Action,
): TxCreateState {
  switch (action.type) {
    case 'TX_CREATE_REQUEST':
      return { ...state, inProgress: true, created: false, error: null }

    case 'TX_CREATE_SUCCESS':
      return { ...state, created: true, inProgress: false }

    case 'TX_CREATE_FAILURE':
      return {
        ...state,
        error: {
          code: action.code,
          message: action.message,
        },
        created: false,
        inProgress: false,
      }

    case 'TX_FORM_RESET':
      return { ...state, created: false }

    default:
      return state
  }
}

const txSend = function (
  state: TxSendState = initialState.txSend,
  action: Action,
): TxSendState {
  switch (action.type) {
    case 'TX_SEND_ADDRESS_REQUEST':
      return { ...state, inProgress: true, sent: false, error: null }

    case 'TX_SEND_ADDRESS_SUCCESS':
      return { ...state, sent: true, inProgress: false }

    case 'TX_SEND_ADDRESS_FAILURE':
      return {
        ...state,
        error: {
          code: action.code,
          message: action.message,
        },
        sent: false,
        inProgress: false,
      }

    case 'TX_FORM_RESET':
      return { ...state, sent: false }

    default:
      return state
  }
}

const txPost = function (
  state: TxPostState = initialState.txPost,
  action: Action,
): TxPostState {
  switch (action.type) {
    case 'TX_POST_SHOW':
      return {
        ...state,
        txSlateId: action.txSlateId,
        showModal: true,
        posted: false,
      }

    case 'TX_POST_CLOSE':
      return { ...state, txSlateId: null, showModal: false, posted: false }

    case 'TX_POST_REQUEST':
      return { ...state, inProgress: true, posted: false, error: null }

    case 'TX_POST_SUCCESS':
      return { ...state, inProgress: false, posted: true }

    case 'TX_POST_FAILURE':
      return {
        ...state,
        error: {
          code: action.code,
          message: action.message,
        },
        posted: false,
        inProgress: false,
      }

    default:
      return state
  }
}

const txGet = function (
  state: TxGetState = initialState.txGet,
  action: Action,
): TxGetState {
  switch (action.type) {
    case 'TX_GET_REQUEST':
      return {
        data: initialState.txGet.data,
        inProgress: true,
        isRefreshed: false,
        error: null,
      }

    case 'TX_GET_SUCCESS':
      return {
        ...state,
        data: mapRustTx(action.tx),
        isRefreshed: action.isRefreshed,
        inProgress: false,
      }

    case 'TX_GET_FAILURE':
      return {
        ...state,
        error: {
          code: action.code,
          message: action.message,
        },
        isRefreshed: false,
        inProgress: false,
      }

    default:
      return state
  }
}

const txCancel = function (
  state: TxCancelState = initialState.txCancel,
  action: Action,
): TxCancelState {
  switch (action.type) {
    case 'TX_CANCEL_REQUEST':
      return { ...state, inProgress: true, error: null }

    case 'TX_CANCEL_SUCCESS':
      return { ...state, inProgress: false }

    case 'TX_CANCEL_FAILURE':
      return {
        ...state,
        error: {
          code: action.code,
          message: action.message,
        },
        inProgress: false,
      }

    default:
      return state
  }
}

const txReceive = function (
  state: TxReceiveState = initialState.txReceive,
  action: Action,
): TxReceiveState {
  switch (action.type) {
    case 'TX_RECEIVE_REQUEST':
      return { ...state, inProgress: true, received: false, error: null }

    case 'TX_RECEIVE_SUCCESS':
      return { ...state, received: true, inProgress: false }

    case 'TX_RECEIVE_FAILURE':
      return {
        ...state,
        error: {
          code: action.code,
          message: action.message,
        },
        received: false,
        inProgress: false,
      }

    default:
      return state
  }
}

const txFinalize = function (
  state: TxFinalizeState = initialState.txFinalize,
  action: Action,
): TxFinalizeState {
  switch (action.type) {
    case 'TX_FINALIZE_REQUEST':
      return { ...state, inProgress: true, finalized: false, error: null }

    case 'TX_FINALIZE_SUCCESS':
      return { ...state, finalized: true, inProgress: false }

    case 'TX_FINALIZE_FAILURE':
      return {
        ...state,
        error: {
          code: action.code,
          message: action.message,
        },
        finalized: false,
        inProgress: false,
      }

    default:
      return state
  }
}

const txForm = function (
  state: TxForm = initialState.txForm,
  action: Action,
): TxForm {
  switch (action.type) {
    case 'TX_FORM_SET_FROM_LINK':
      return {
        ...initialState.txForm,
        amount: action.amount,
        textAmount: action.textAmount,
        address: action.url,
        message: action.message,
      }

    case 'TX_FORM_SET_AMOUNT':
      return { ...state, amount: action.amount, textAmount: action.textAmount }

    case 'TX_FORM_SET_ADDRESS':
      return { ...state, address: action.address }

    case 'TX_FORM_SET_OUTPUT_STRATEGY':
      return { ...state, outputStrategy: action.outputStrategy }

    case 'TX_FORM_OUTPUT_STRATEGIES_REQUEST':
      return {
        ...state,
        outputStrategies_inProgress: true,
        outputStrategies_error: '',
        outputStrategies: [],
        outputStrategy: null,
      }

    case 'TX_FORM_OUTPUT_STRATEGIES_FAILURE':
      return {
        ...state,
        outputStrategies_inProgress: false,
        outputStrategies_error: action.message,
        outputStrategies: [],
        outputStrategy: null,
      }

    case 'TX_FORM_OUTPUT_STRATEGIES_SUCCESS': {
      const strategies =
        action.outputStrategies.length == 2 &&
        action.outputStrategies[0].fee === action.outputStrategies[1].fee &&
        action.outputStrategies[0].total == action.outputStrategies[1].total
          ? [action.outputStrategies[0]]
          : action.outputStrategies
      const outputStrategies = strategies
        .map(mapRustOutputStrategy)
        .sort((a: OutputStrategy, b: OutputStrategy) => {
          return new BigNumber(a.fee).minus(b.fee).toNumber()
        })
      return {
        ...state,
        outputStrategies,
        outputStrategy: outputStrategies.length ? outputStrategies[0] : null,
        outputStrategies_inProgress: false,
        outputStrategies_error: '',
      }
    }

    case 'TX_FORM_SET_MESSAGE':
      return { ...state, message: action.message }

    case 'TX_FORM_RESET':
      return { ...initialState.txForm }

    default:
      return state
  }
}

const listPersistConfig = {
  key: 'list',
  storage: AsyncStorage,
  whitelist: ['data'],
}
export const isTxFormInvalid = (txForm: TxForm, transferMethod: string) => {
  const { address, amount, outputStrategy } = txForm

  if (
    !amount ||
    !outputStrategy ||
    (transferMethod === ADDRESS_TRANSPORT_METHOD &&
      address.toLowerCase().indexOf('grin') === -1)
  ) {
    return true
  }

  return false
}
export const reducer = combineReducers({
  list: persistReducer(listPersistConfig, list) as typeof list,
  txCreate,
  txSend,
  txPost,
  txGet,
  txCancel,
  txReceive,
  txFinalize,
  txForm,
})

export const txListSelector = (state: RootState) => state.tx.list.data
