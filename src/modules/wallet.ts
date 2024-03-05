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

import AsyncStorage from '@react-native-async-storage/async-storage'
import { persistReducer } from 'redux-persist'
import {
  Action,
  walletInitRequestAction,
  walletPhraseRequestAction,
  walletDestroyRequestAction,
  walletDestroySuccessAction,
  walletMigrateToMainnetRequestAction,
  walletScanOutputsRequestAction,
  Store,
  walletScanPmmrRangeFalureAction,
  walletScanPmmrRangeRequestAction,
  walletScanOutputsFalureAction,
  walletScanPmmrRangeSuccessAction,
  walletScanOutputsSuccessAction,
  walletScanFailureAction,
} from 'src/common/types'
import { log } from 'src/common/logger'
import { combineReducers } from 'redux'
import {
  mapPmmrRange,
  checkWalletDataDirectory,
  getConfigForRust,
} from 'src/common'
import RNFS from 'react-native-fs'
import { WALLET_DATA_DIRECTORY, TOR_DIRECTORY } from 'src/common'
import WalletBridge from 'src/bridges/wallet'
const MAX_RETRIES = 10
export const RECOVERY_LIMIT = 1000
const PMMR_RANGE_UPDATE_INTERVAL = 60 * 1000 // roughly one block

export type WalletInitState = {
  isNew: boolean
  error: {
    message: string
    code?: number
  }
}
export type WalletScanState = {
  inProgress: boolean
  progress: number
  isDone: boolean
  lastRetrievedIndex?: number
  lowestIndex?: number
  highestIndex?: number
  pmmrRangeLastUpdated?: number
  currentPmmrIndex?: number
  retryCount: number
  error: {
    message: string
    code?: number
  }
}
export type State = {
  walletInit: WalletInitState
  walletScan: WalletScanState
  isCreated: boolean | null
  isOpened: boolean
}

const initialState: State = {
  walletInit: {
    isNew: true,
    error: {
      message: '',
      code: 0,
    },
  },
  walletScan: {
    inProgress: false,
    progress: 0,
    isDone: false,
    currentPmmrIndex: 0,
    retryCount: 0,
    pmmrRangeLastUpdated: 0,
    error: {
      message: '',
      code: 0,
    },
  },
  isCreated: null,
  isOpened: false,
}

const walletInit = function (
  state: WalletInitState = initialState.walletInit,
  action: Action,
): WalletInitState {
  switch (action.type) {
    case 'WALLET_CLEAR': {
      return { ...initialState.walletInit }
    }

    case 'WALLET_INIT_REQUEST':
      return {
        ...state,
        error: {
          message: '',
          code: 0,
        },
      }

    case 'WALLET_INIT_SET_IS_NEW':
      return { ...initialState.walletInit, isNew: action.value }

    case 'WALLET_INIT_FAILURE':
      return {
        ...state,
        error: {
          message: action.message,
          code: 0,
        },
      }

    default:
      return state
  }
}

const walletScan = function (
  state: WalletScanState = initialState.walletScan,
  action: Action,
): WalletScanState {
  switch (action.type) {
    case 'WALLET_SCAN_START':
      return { ...initialState.walletScan, inProgress: true }

    case 'WALLET_SCAN_DONE':
      return { ...initialState.walletScan, isDone: true }

    case 'WALLET_SCAN_RESET':
      return { ...initialState.walletScan }

    case 'WALLET_SCAN_PMMR_RANGE_SUCCESS':
      return {
        ...state,
        lowestIndex: state.lowestIndex
          ? state.lowestIndex
          : action.range.lastRetrievedIndex,
        lastRetrievedIndex: state.lastRetrievedIndex
          ? state.lastRetrievedIndex
          : action.range.lastRetrievedIndex,
        highestIndex: action.range.highestIndex,
        pmmrRangeLastUpdated: Date.now(),
        retryCount: 0,
      }

    case 'WALLET_SCAN_PMMR_RANGE_FAILURE':
      return { ...state, retryCount: state.retryCount + 1 }

    case 'WALLET_SCAN_OUTPUTS_REQUEST':
      return { ...state, error: initialState.walletScan.error }

    case 'WALLET_SCAN_OUTPUTS_SUCCESS': {
      if (!state.highestIndex || !state.lowestIndex) {
        return state
      }

      const range = state.highestIndex - state.lowestIndex
      const progress = action.lastRetrievedIndex - state.lowestIndex
      const percentageComplete = Math.min(
        Math.round((progress / range) * 100),
        99,
      )
      return {
        ...state,
        retryCount: 0,
        progress: percentageComplete,
        lastRetrievedIndex: action.lastRetrievedIndex,
      }
    }

    case 'WALLET_SCAN_OUTPUTS_FAILURE':
      return { ...state, retryCount: state.retryCount + 1 }

    case 'WALLET_SCAN_FAILURE':
      return {
        ...state,
        inProgress: false,
        isDone: true,
        error: {
          message: action.message,
        },
      }

    default:
      return state
  }
}

export const reducer = combineReducers({
  isCreated: function (
    state: State['isCreated'] = initialState.isCreated,
    action: Action,
  ): boolean | null {
    switch (action.type) {
      case 'WALLET_DESTROY_SUCCESS':
        return false
      case 'WALLET_INIT_SUCCESS':
        return true
      case 'WALLET_EXISTS_SUCCESS':
        return action.exists
      default:
        return state
    }
  },
  isOpened: function (
    state: State['isOpened'] = initialState.isOpened,
    action: Action,
  ): boolean | null {
    switch (action.type) {
      case 'SET_WALLET_OPEN':
        return true
      case 'CLOSE_WALLET':
        return false
      default:
        return state
    }
  },
  walletInit: persistReducer(
    {
      key: 'walletInit',
      storage: AsyncStorage,
      whitelist: ['isNew'],
    },
    walletInit,
  ) as typeof walletInit,
  walletScan: persistReducer(
    {
      key: 'walletScan',
      storage: AsyncStorage,
      whitelist: [
        'inProgress',
        'isDone',
        'progress',
        'lastRetrievedIndex',
        'highestIndex',
        'downloadedInBytes',
      ],
    },
    walletScan,
  ) as typeof walletScan,
})
export const sideEffects = {
  ['WALLET_INIT_REQUEST']: async (
    action: walletInitRequestAction,
    store: Store,
  ) => {
    const { password, phrase, isNew } = action
    const configForWalletRust = getConfigForRust(store.getState())
    await checkWalletDataDirectory()
    try {
      await WalletBridge.walletInit(
        JSON.stringify(configForWalletRust),
        phrase,
        password,
      )
      await WalletBridge.openWallet(
        JSON.stringify(configForWalletRust),
        password,
      )
      store.dispatch({
        type: 'SET_WALLET_OPEN',
      })
      if (isNew) {
        store.dispatch({
          type: 'WALLET_SCAN_DONE',
        })
      } else {
        store.dispatch({
          type: 'WALLET_SCAN_START',
        })
      }
      setTimeout(() => {
        store.dispatch({
          type: 'WALLET_INIT_SUCCESS',
        })
      }, 250)
    } catch (error) {
      store.dispatch({
        type: 'WALLET_INIT_FAILURE',
        message: error.message,
      })
      log(error, true)
      return
    }
  },
  ['WALLET_SCAN_FAILURE']: async (action: walletScanFailureAction) => {
    log(action, true)
  },
  ['CLOSE_WALLET']: async () => {
    try {
      await WalletBridge.closeWallet()
    } catch (error) {
      log(error, true)
    }
  },
  ['WALLET_SCAN_PMMR_RANGE_REQUEST']: async (
    _action: walletScanPmmrRangeRequestAction,
    store: Store,
  ) => {
    await checkWalletDataDirectory()

    try {
      const range = mapPmmrRange(
        JSON.parse(await WalletBridge.walletPmmrRange()),
      )
      store.dispatch({
        type: 'WALLET_SCAN_PMMR_RANGE_SUCCESS',
        range,
      })
    } catch (error) {
      store.dispatch({
        type: 'WALLET_SCAN_PMMR_RANGE_FAILURE',
        message: error.message,
      })
    }
  },
  ['WALLET_SCAN_PMMR_RANGE_SUCCESS']: async (
    _action: walletScanPmmrRangeSuccessAction,
    store: Store,
  ) => {
    const { lastRetrievedIndex } = store.getState().wallet.walletScan
    store.dispatch({
      type: 'WALLET_SCAN_OUTPUTS_REQUEST',
      lastRetrievedIndex: lastRetrievedIndex ?? 0,
    })
  },
  ['WALLET_SCAN_PMMR_RANGE_FAILURE']: async (
    action: walletScanPmmrRangeFalureAction,
    store: Store,
  ) => {
    const { message } = action
    const { retryCount } = store.getState().wallet.walletScan

    if (retryCount < MAX_RETRIES) {
      store.dispatch({
        type: 'WALLET_SCAN_PMMR_RANGE_REQUEST',
      })
    } else {
      store.dispatch({
        type: 'WALLET_SCAN_FAILURE',
        message,
      })
    }
  },
  ['WALLET_SCAN_OUTPUTS_REQUEST']: async (
    action: walletScanOutputsRequestAction,
    store: Store,
  ) => {
    const { lastRetrievedIndex } = action
    const { highestIndex, lowestIndex } = store.getState().wallet.walletScan

    if (!lowestIndex || !highestIndex) {
      store.dispatch({
        type: 'WALLET_SCAN_PMMR_RANGE_REQUEST',
      })
      return
    }

    await checkWalletDataDirectory()

    try {
      const newlastRetrievedIndex = JSON.parse(
        await WalletBridge.walletScanOutputs(
          lastRetrievedIndex ?? 0,
          highestIndex,
        ),
      )
      store.dispatch({
        type: 'WALLET_SCAN_OUTPUTS_SUCCESS',
        lastRetrievedIndex: newlastRetrievedIndex,
      })
    } catch (error) {
      store.dispatch({
        type: 'WALLET_SCAN_OUTPUTS_FAILURE',
        message: error.message,
      })
    }
  },
  ['WALLET_SCAN_OUTPUTS_SUCCESS']: async (
    action: walletScanOutputsSuccessAction,
    store: Store,
  ) => {
    const { lastRetrievedIndex, highestIndex, pmmrRangeLastUpdated } =
      store.getState().wallet.walletScan

    if (
      !pmmrRangeLastUpdated ||
      Date.now() - pmmrRangeLastUpdated > PMMR_RANGE_UPDATE_INTERVAL
    ) {
      store.dispatch({
        type: 'WALLET_SCAN_PMMR_RANGE_REQUEST',
      })
    } else {
      if (lastRetrievedIndex == highestIndex) {
        store.dispatch({
          type: 'WALLET_SCAN_DONE',
        })
      } else {
        if (store.getState().wallet.isOpened) {
          store.dispatch({
            type: 'WALLET_SCAN_OUTPUTS_REQUEST',
            lastRetrievedIndex: action.lastRetrievedIndex,
          })
        }
      }
    }
  },
  ['WALLET_SCAN_OUTPUTS_FAILURE']: async (
    action: walletScanOutputsFalureAction,
    store: Store,
  ) => {
    const { message } = action
    const { retryCount, lastRetrievedIndex } = store.getState().wallet.walletScan

    if (store.getState().wallet.isOpened) {
      // we ignore these errors, if wallet is closed
      return
    }
    if (retryCount < MAX_RETRIES && lastRetrievedIndex) {
      store.dispatch({
        type: 'WALLET_SCAN_OUTPUTS_REQUEST',
        lastRetrievedIndex,
      })
    } else {
      store.dispatch({
        type: 'WALLET_SCAN_FAILURE',
        message,
      })
    }
  },
  ['WALLET_PHRASE_REQUEST']: (
    action: walletPhraseRequestAction,
    store: Store,
  ) => {
    return WalletBridge.walletPhrase(
      getConfigForRust(store.getState()).wallet_dir,
      // TODO: Add password here
      action.password,
    )
      .then((phrase: string) => {
        store.dispatch({
          type: 'WALLET_PHRASE_SUCCESS',
          phrase,
        })
      })
      .catch((error: Error) => {
        store.dispatch({
          type: 'WALLET_PHRASE_FAILURE',
          message: error.message,
        })
        log(error, true)
      })
  },
  ['WALLET_DESTROY_REQUEST']: async (
    _action: walletDestroyRequestAction,
    store: Store,
  ) => {
    try {
      if (await RNFS.exists(TOR_DIRECTORY)) {
        await RNFS.unlink(TOR_DIRECTORY)
      }
      await RNFS.unlink(WALLET_DATA_DIRECTORY)
      store.dispatch({
        type: 'TX_LIST_CLEAR',
      })
      store.dispatch({
        type: 'RESET_BIOMETRY_REQUEST',
      })
      store.dispatch({
        type: 'WALLET_DESTROY_SUCCESS',
      })
    } catch (error) {
      store.dispatch({
        type: 'WALLET_PHRASE_FAILURE',
        message: error.message,
      })
      log(error, true)
    }
  },
  ['WALLET_DESTROY_SUCCESS']: (
    _action: walletDestroySuccessAction,
    store: Store,
  ) => {
    store.dispatch({
      type: 'WALLET_CLEAR',
    })
    store.dispatch({
      type: 'ACCEPT_LEGAL',
      value: false,
    })
  },
  ['WALLET_MIGRATE_TO_MAINNET_REQUEST']: (
    _action: walletMigrateToMainnetRequestAction,
    store: Store,
  ) => {
    store.dispatch({
      type: 'SWITCH_TO_MAINNET',
    })
    store.dispatch({
      type: 'WALLET_DESTROY_REQUEST',
    })
  },
  ['WALLET_EXISTS_REQUEST']: async (
    _action: walletDestroySuccessAction,
    store: Store,
  ) => {
    try {
      const exists = await WalletBridge.isWalletCreated()
      store.dispatch({
        type: 'WALLET_EXISTS_SUCCESS',
        exists,
      })
    } catch (error) {
      store.dispatch({
        type: 'WALLET_EXISTS_FAILURE',
        message: error.message,
      })
      log(error, true)
    }
  },
}
