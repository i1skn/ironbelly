// @flow
//
// Copyright 2019 Ivan Sorokin.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Share, NativeModules } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import moment from 'moment'
import { combineReducers } from 'redux'
import RNFS from 'react-native-fs'

import { getStateForRust, mapRustTx, mapRustOutputStrategy, getSlatePath } from 'common'
import { log } from 'common/logger'
import {
  type RustTx,
  type Tx,
  type Action,
  type Store,
  type Slate,
  type txCancelRequestAction,
  type txListRequestAction,
  type txCreateRequestAction,
  type txSendHttpsRequestAction,
  type txPostRequestAction,
  type txReceiveRequestAction,
  type txFinalizeRequestAction,
  type slateSetRequestAction,
  type slateRemoveRequestAction,
  type slateLoadRequestAction,
  type slateShareRequestAction,
  type txGetRequestAction,
  type txFormOutputStrategiesRequestAction,
  type Error,
  type OutputStrategy,
} from 'common/types'

const { GrinBridge } = NativeModules

export type ListState = {|
  data: Array<Tx>,
  inProgress: boolean,
  isOffline: boolean,
  refreshFromNode: boolean,
  showLoader: boolean,
  lastUpdated: ?moment,
  error: ?Error,
|}

export type TxCreateState = {|
  data: ?Tx,
  created: boolean,
  inProgress: boolean,
  error: ?Error,
|}

export type TxSendState = {|
  data: ?Tx,
  sent: boolean,
  inProgress: boolean,
  error: ?Error,
|}

export type TxPostState = {|
  txSlateId: ?string,
  showModal: boolean,
  posted: boolean,
  inProgress: boolean,
  error: ?Error,
|}

export type TxGetState = {|
  data: ?Tx,
  validated: boolean,
  inProgress: boolean,
  error: ?Error,
|}

export type TxReceiveState = {|
  data: ?Tx,
  received: boolean,
  inProgress: boolean,
  error: ?Error,
|}

export type TxFinalizeState = {|
  data: ?Tx,
  finalized: boolean,
  inProgress: boolean,
  error: ?Error,
|}

export type TxCancelState = {|
  data: ?Tx,
  inProgress: boolean,
  error: ?Error,
|}

export type TxForm = {|
  amount: number,
  outputStrategy: ?OutputStrategy,
  outputStrategies: Array<OutputStrategy>,
  outputStrategies_error: string,
  outputStrategies_inProgress: boolean,
  textAmount: string,
  message: string,
  url: string,
|}

export type SlateState = {|
  data: ?Slate,
  inProgress: boolean,
  error: ?Error,
|}

export type State = $ReadOnly<{|
  list: ListState,
  txCreate: TxCreateState,
  txSend: TxSendState,
  txGet: TxGetState,
  txPost: TxPostState,
  txCancel: TxCancelState,
  txReceive: TxReceiveState,
  txFinalize: TxFinalizeState,
  txForm: TxForm,
  slate: SlateState,
|}>

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
    validated: false,
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
    url: '',
  },
  slate: {
    data: null,
    inProgress: false,
    error: null,
  },
}

export const sideEffects = {
  ['TX_LIST_REQUEST']: async (action: txListRequestAction, store: Store) => {
    try {
      let finalized = await AsyncStorage.getItem('@finalizedTxs').then(JSON.parse)
      if (!finalized) {
        finalized = []
      }
      const newFinalized = []
      let posted = await AsyncStorage.getItem('@postedTxs').then(JSON.parse)
      if (!posted) {
        posted = []
      }
      const newPosted = []
      const data = await GrinBridge.txsGet(
        getStateForRust(store.getState()),
        action.refreshFromNode
      ).then(JSON.parse)
      const mappedData = data[1]
        .filter((tx: RustTx) => tx.tx_type.indexOf('Cancelled') === -1)
        .map((tx: RustTx) => {
          let pos = finalized.indexOf(tx.tx_slate_id)
          if (pos !== -1) {
            if (tx.confirmed) {
              return tx
            } else {
              newFinalized.push(tx.tx_slate_id)
              return { ...tx, tx_type: 'TxFinalized' }
            }
          }
          pos = posted.indexOf(tx.tx_slate_id)
          if (pos !== -1) {
            if (tx.confirmed) {
              return tx
            } else {
              newPosted.push(tx.tx_slate_id)
              return { ...tx, tx_type: 'TxPosted' }
            }
          }
          return tx
        })
      await AsyncStorage.setItem('@finalizedTxs', JSON.stringify(newFinalized))
      await AsyncStorage.setItem('@postedTxs', JSON.stringify(newPosted))
      store.dispatch({ type: 'TX_LIST_SUCCESS', data: mappedData, validated: data[0] })
    } catch (e) {
      store.dispatch({ type: 'TX_LIST_FAILURE', message: e.message })
      log(e, true)
    }
  },
  ['TX_CANCEL_REQUEST']: (action: txCancelRequestAction, store: Store) => {
    return GrinBridge.txCancel(getStateForRust(store.getState()), action.id)
      .then(list => {
        store.dispatch({ type: 'TX_CANCEL_SUCCESS' })
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
        store.dispatch({ type: 'BALANCE_REQUEST' })
      })
      .catch(error => {
        const e = JSON.parse(error.message)
        store.dispatch({ type: 'TX_CANCEL_FAILURE', code: 1, message: error })
        log(e, true)
      })
  },
  ['TX_GET_REQUEST']: (action: txGetRequestAction, store: Store) => {
    return GrinBridge.txGet(getStateForRust(store.getState()), true, action.txSlateId)
      .then((json: string) => JSON.parse(json))
      .then(result => {
        store.dispatch({ type: 'TX_GET_SUCCESS', validated: result[0], tx: result[1][0] })
      })
      .catch(error => {
        const e = JSON.parse(error.message)
        store.dispatch({ type: 'TX_GET_FAILURE', code: 1, message: error })
        log(e, true)
      })
  },
  ['TX_CREATE_REQUEST']: (action: txCreateRequestAction, store: Store) => {
    return GrinBridge.txCreate(
      getStateForRust(store.getState()),
      action.amount,
      action.selectionStrategyIsUseAll,
      action.message
    )
      .then((json: string) => JSON.parse(json))
      .then((slate: Slate) => {
        store.dispatch({ type: 'TX_CREATE_SUCCESS' })
        store.dispatch({ type: 'SLATE_SET_REQUEST', slate, isResponse: false })
        store.dispatch({ type: 'SLATE_SHARE_REQUEST', id: slate.id, isResponse: false })

        store.dispatch({ type: 'TX_LIST_REQUEST', showLoader: false, refreshFromNode: true })
        store.dispatch({ type: 'BALANCE_REQUEST' })
      })
      .catch(error => {
        const e = JSON.parse(error.message)
        store.dispatch({ type: 'TX_CREATE_FAILURE', ...e })
        log(e, true)
      })
  },
  ['TX_SEND_HTTPS_REQUEST']: async (action: txSendHttpsRequestAction, store: Store) => {
    try {
      let finalized = await AsyncStorage.getItem('@finalizedTxs').then(JSON.parse)
      if (!finalized) {
        finalized = []
      }
      const slate = await GrinBridge.txSendHttps(
        getStateForRust(store.getState()),
        action.amount,
        action.selectionStrategyIsUseAll,
        action.message,
        action.url
      ).then(JSON.parse)
      finalized.push(slate.id)
      await AsyncStorage.setItem('@finalizedTxs', JSON.stringify(finalized))
      store.dispatch({ type: 'TX_SEND_HTTPS_SUCCESS' })
      store.dispatch({ type: 'TX_POST_SHOW', txSlateId: slate.id })
      store.dispatch({ type: 'TX_LIST_REQUEST', showLoader: false, refreshFromNode: true })
      store.dispatch({ type: 'BALANCE_REQUEST' })
    } catch (e) {
      store.dispatch({ type: 'TX_SEND_HTTPS_FAILURE', message: e.message })
      log(e, true)
    }
  },
  ['TX_POST_REQUEST']: async (action: txPostRequestAction, store: Store) => {
    try {
      let finalized = await AsyncStorage.getItem('@finalizedTxs').then(JSON.parse)
      if (!finalized) {
        finalized = []
      }
      let posted = await AsyncStorage.getItem('@postedTxs').then(JSON.parse)
      if (!posted) {
        posted = []
      }
      await GrinBridge.txPost(getStateForRust(store.getState()), action.txSlateId)
      posted.push(action.txSlateId)
      let pos = finalized.indexOf(action.txSlateId)
      if (pos !== -1) {
        finalized.splice(pos, 1)
      }
      await AsyncStorage.setItem('@finalizedTxs', JSON.stringify(finalized))
      await AsyncStorage.setItem('@postedTxs', JSON.stringify(posted))
      store.dispatch({ type: 'TX_POST_SUCCESS' })
      store.dispatch({ type: 'TX_LIST_REQUEST', showLoader: false, refreshFromNode: true })
      store.dispatch({ type: 'BALANCE_REQUEST' })
      setTimeout(() => {
        store.dispatch({ type: 'TX_POST_CLOSE' })
      }, 3000)
    } catch (e) {
      store.dispatch({ type: 'TX_POST_FAILURE', message: e.message })
      log(e, true)
    }
  },
  ['TX_RECEIVE_REQUEST']: (action: txReceiveRequestAction, store: Store) => {
    return GrinBridge.txReceive(getStateForRust(store.getState()), action.slatePath, 'Received')
      .then((json: string) => JSON.parse(json))
      .then((slate: Slate) => {
        store.dispatch({ type: 'TX_RECEIVE_SUCCESS' })
        store.dispatch({ type: 'SLATE_SHARE_REQUEST', id: slate.id, isResponse: true })
        store.dispatch({ type: 'SLATE_SET_REQUEST', slate, isResponse: true })
        store.dispatch({ type: 'TX_LIST_REQUEST', showLoader: false, refreshFromNode: true })
        store.dispatch({ type: 'BALANCE_REQUEST' })
      })
      .catch(error => {
        const e = JSON.parse(error.message)
        store.dispatch({ type: 'TX_RECEIVE_FAILURE', ...e })
        log(e, true)
      })
  },
  ['TX_FINALIZE_REQUEST']: async (action: txFinalizeRequestAction, store: Store) => {
    try {
      let finalized = await AsyncStorage.getItem('@finalizedTxs').then(JSON.parse)
      if (!finalized) {
        finalized = []
      }
      const slate = await GrinBridge.txFinalize(
        getStateForRust(store.getState()),
        action.responseSlatePath
      ).then(JSON.parse)
      store.dispatch({ type: 'TX_FINALIZE_SUCCESS' })
      finalized.push(slate.id)
      await AsyncStorage.setItem('@finalizedTxs', JSON.stringify(finalized))
      store.dispatch({ type: 'TX_POST_SHOW', txSlateId: slate.id })
      store.dispatch({ type: 'TX_LIST_REQUEST', showLoader: false, refreshFromNode: true })
      store.dispatch({ type: 'BALANCE_REQUEST' })
    } catch (e) {
      store.dispatch({ type: 'TX_FINALIZE_FAILURE', message: e.message })
      log(e, true)
    }
  },
  ['SLATE_LOAD_REQUEST']: (action: slateLoadRequestAction, store: Store) => {
    return RNFS.readFile(action.slatePath, 'utf8')
      .then((json: string) => JSON.parse(json))
      .then(slate => {
        store.dispatch({ type: 'SLATE_LOAD_SUCCESS', slate })
      })
      .catch(error => {
        store.dispatch({ type: 'SLATE_LOAD_FAILURE', code: 1, message: error.message })
        log(error, true)
      })
  },
  ['SLATE_SET_REQUEST']: (action: slateSetRequestAction, store: Store) => {
    const path = getSlatePath(action.slate.id, action.isResponse)
    return RNFS.writeFile(path, JSON.stringify(action.slate), 'utf8')
      .then(success => {
        store.dispatch({ type: 'SLATE_SET_SUCCESS', slate })
      })
      .catch(error => {
        store.dispatch({ type: 'SLATE_SET_FAILURE', code: 1, message: error.message })
        log(error, true)
      })
  },
  ['SLATE_REMOVE_REQUEST']: async (action: slateRemoveRequestAction, store: Store) => {
    const path = getSlatePath(action.id, action.isResponse)
    if (await RNFS.exists(path)) {
      return RNFS.unlink(path)
        .then(success => {
          store.dispatch({ type: 'SLATE_REMOVE_SUCCESS' })
        })
        .catch(error => {
          store.dispatch({ type: 'SLATE_REMOVE_FAILURE', code: 1, message: error.message })
          log(error, true)
        })
    } else {
      store.dispatch({ type: 'SLATE_REMOVE_SUCCESS' })
    }
  },
  ['SLATE_SHARE_REQUEST']: (action: slateShareRequestAction, store: Store) => {
    const path = getSlatePath(action.id, action.isResponse)
    return Share.share({
      url: path,
    })
      .then(success => {
        store.dispatch({ type: 'SLATE_SHARE_SUCCESS' })
      })
      .catch(error => {
        store.dispatch({ type: 'SLATE_SHARE_FAILURE', code: 1, message: error.message })
        log(error, true)
      })
  },
  ['TX_FORM_OUTPUT_STRATEGIES_REQUEST']: (
    action: txFormOutputStrategiesRequestAction,
    store: Store
  ) => {
    return GrinBridge.txStrategies(getStateForRust(store.getState()), action.amount)
      .then((json: string) => JSON.parse(json))
      .then(outputStrategies => {
        store.dispatch({ type: 'TX_FORM_OUTPUT_STRATEGIES_SUCCESS', outputStrategies })
      })
      .catch(error => {
        store.dispatch({
          type: 'TX_FORM_OUTPUT_STRATEGIES_FAILURE',
          code: 1,
          message: error.message,
        })
        log(error, true)
      })
  },
}

const list = function(state: ListState = initialState.list, action): ListState {
  switch (action.type) {
    case 'TX_LIST_CLEAR':
      return {
        ...state,
        data: [],
      }
    case 'TX_LIST_REQUEST':
      return {
        ...state,
        inProgress: true,
        refreshFromNode: action.refreshFromNode,
        showLoader: action.showLoader,
        error: null,
      }
    case 'TX_LIST_SUCCESS':
      var txs = action.data.slice(0)
      txs.sort(function(a, b) {
        return new Date(b.creation_ts) - new Date(a.creation_ts)
      })
      return {
        ...state,
        data: txs.map(mapRustTx),
        showLoader: false,
        refreshFromNode: false,
        isOffline: state.refreshFromNode && !action.validated,
        lastUpdated: moment(),
        inProgress: false,
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

const txCreate = function(state: TxCreateState = initialState.txCreate, action): TxCreateState {
  switch (action.type) {
    case 'TX_CREATE_REQUEST':
      return {
        ...state,
        inProgress: true,
        created: false,
        error: null,
      }
    case 'TX_CREATE_SUCCESS':
      return {
        ...state,
        created: true,
        inProgress: false,
      }
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
    default:
      return state
  }
}

const txSend = function(state: TxSendState = initialState.txSend, action): TxSendState {
  switch (action.type) {
    case 'TX_SEND_HTTPS_REQUEST':
      return {
        ...state,
        inProgress: true,
        sent: false,
        error: null,
      }
    case 'TX_SEND_HTTPS_SUCCESS':
      return {
        ...state,
        sent: true,
        inProgress: false,
      }
    case 'TX_SEND_HTTPS_FAILURE':
      return {
        ...state,
        error: {
          code: action.code,
          message: action.message,
        },
        sent: false,
        inProgress: false,
      }
    default:
      return state
  }
}

const txPost = function(state: TxPostState = initialState.txPost, action): TxPostState {
  switch (action.type) {
    case 'TX_POST_SHOW':
      return {
        ...state,
        txSlateId: action.txSlateId,
        showModal: true,
        posted: false,
      }
    case 'TX_POST_CLOSE':
      return {
        ...state,
        txSlateId: null,
        showModal: false,
        posted: false,
      }
    case 'TX_POST_REQUEST':
      return {
        ...state,
        inProgress: true,
        posted: false,
        error: null,
      }
    case 'TX_POST_SUCCESS':
      return {
        ...state,
        inProgress: false,
        posted: true,
      }
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

const txGet = function(state: TxGetState = initialState.txGet, action): TxGetState {
  switch (action.type) {
    case 'TX_GET_REQUEST':
      return {
        ...state,
        inProgress: true,
        validated: false,
        error: null,
      }
    case 'TX_GET_SUCCESS':
      return {
        ...state,
        data: mapRustTx(action.tx),
        validated: action.validated,
        inProgress: false,
      }
    case 'TX_GET_FAILURE':
      return {
        ...state,
        error: {
          code: action.code,
          message: action.message,
        },
        validated: false,
        inProgress: false,
      }
    default:
      return state
  }
}

const txCancel = function(state: TxCancelState = initialState.txCancel, action): TxCancelState {
  switch (action.type) {
    case 'TX_CANCEL_REQUEST':
      return {
        ...state,
        inProgress: true,
        error: null,
      }
    case 'TX_CANCEL_SUCCESS':
      return {
        ...state,
        inProgress: false,
      }
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

const txReceive = function(state: TxReceiveState = initialState.txReceive, action): TxReceiveState {
  switch (action.type) {
    case 'SLATE_GET_SUCCESS':
    case 'SLATE_LOAD_SUCCESS':
      return {
        ...state,
        inProgress: false,
        received: false,
        error: null,
      }
    case 'TX_RECEIVE_REQUEST':
      return {
        ...state,
        inProgress: true,
        received: false,
        error: null,
      }
    case 'TX_RECEIVE_SUCCESS':
      return {
        ...state,
        received: true,
        inProgress: false,
      }
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

const txFinalize = function(
  state: TxFinalizeState = initialState.txFinalize,
  action
): TxFinalizeState {
  switch (action.type) {
    case 'SLATE_GET_SUCCESS':
    case 'SLATE_LOAD_SUCCESS':
      return {
        ...state,
        inProgress: false,
        finalized: false,
        error: null,
      }
    case 'TX_FINALIZE_REQUEST':
      return {
        ...state,
        inProgress: true,
        finalized: false,
        error: null,
      }
    case 'TX_FINALIZE_SUCCESS':
      return {
        ...state,
        finalized: true,
        inProgress: false,
      }
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

const txForm = function(state: TxForm = initialState.txForm, action: Action): TxForm {
  switch (action.type) {
    case 'TX_FORM_SET_FROM_LINK':
      return {
        ...initialState.txForm,
        amount: action.amount,
        textAmount: action.textAmount,
        url: action.url,
        message: action.message,
      }

    case 'TX_FORM_SET_AMOUNT':
      return {
        ...state,
        amount: action.amount,
        textAmount: action.textAmount,
      }
    case 'TX_FORM_SET_URL':
      return {
        ...state,
        url: action.url,
      }
    case 'TX_FORM_SET_OUTPUT_STRATEGY':
      return {
        ...state,
        outputStrategy: action.outputStrategy,
      }
    case 'TX_FORM_OUTPUT_STRATEGIES_REQUEST':
      return {
        ...state,
        outputStrategies_inProgress: true,
        outputStrategies_error: '',
      }
    case 'TX_FORM_OUTPUT_STRATEGIES_FAILURE':
      return {
        ...state,
        outputStrategies_inProgress: false,
        outputStrategies_error: action.message,
      }

    case 'TX_FORM_OUTPUT_STRATEGIES_SUCCESS':
      const strategies =
        action.outputStrategies.length == 2 &&
        action.outputStrategies[0].fee === action.outputStrategies[1].fee &&
        action.outputStrategies[0].total == action.outputStrategies[1].total
          ? [action.outputStrategies[0]]
          : action.outputStrategies
      const outputStrategies = strategies.map(mapRustOutputStrategy)
      return {
        ...state,
        outputStrategies,
        outputStrategy: outputStrategies.length ? outputStrategies[0] : null,
        outputStrategies_inProgress: false,
      }
    case 'TX_FORM_SET_MESSAGE':
      return {
        ...state,
        message: action.message,
      }
    case 'TX_FORM_RESET':
      return { ...initialState.txForm }
    default:
      return state
  }
}

const slate = function(state: SlateState = initialState.slate, action): SlateState {
  switch (action.type) {
    case 'SLATE_GET_REQUEST':
    case 'SLATE_LOAD_REQUEST':
      return {
        ...state,
        inProgress: true,
        error: null,
      }
    case 'SLATE_GET_SUCCESS':
    case 'SLATE_LOAD_SUCCESS':
      return {
        ...state,
        data: action.slate,
        inProgress: false,
      }
    case 'SLATE_GET_FAILURE':
    case 'SLATE_LOAD_FAILURE':
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

export const reducer = combineReducers({
  list,
  txCreate,
  txSend,
  txPost,
  txGet,
  txCancel,
  txReceive,
  txFinalize,
  txForm,
  slate,
})
