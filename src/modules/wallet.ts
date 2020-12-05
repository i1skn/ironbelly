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

import AsyncStorage from '@react-native-community/async-storage'
import { persistReducer } from 'redux-persist'
import {
  Action,
  walletInitRequestAction,
  seedNewRequestAction,
  walletPhraseRequestAction,
  invalidPasswordAction,
  walletDestroyRequestAction,
  walletDestroySuccessAction,
  walletMigrateToMainnetRequestAction,
  walletScanOutputsRequestAction,
  checkPasswordAction,
  checkPasswordFromBiometryAction,
  Store,
  walletScanPmmrRangeFalureAction,
  walletScanPmmrRangeRequestAction,
  walletScanOutputsFalureAction,
  walletScanPmmrRangeSuccessAction,
  walletScanOutputsSuccessAction,
  walletScanFailureAction,
  clearPasswordAction,
} from 'src/common/types'
import { log } from 'src/common/logger'
import { combineReducers } from 'redux'
import {
  mapPmmrRange,
  getStateForRust,
  checkWalletDataDirectory,
} from 'src/common'
import RNFS from 'react-native-fs'
import { WALLET_DATA_DIRECTORY, TOR_DIRECTORY } from 'src/common'
import WalletBridge from 'src/bridges/wallet'
const MAX_RETRIES = 10
export const RECOVERY_LIMIT = 1000
const PMMR_RANGE_UPDATE_INTERVAL = 60 * 1000 // roughly one block

export type WalletInitState = {
  mnemonic: string
  password: string
  confirmPassword: string
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
export type WalletPhraseState = {
  inProgress: boolean
  phrase: string
}
export type PasswordState = {
  value: string
  valid: boolean
  error: {
    message: string
    code?: number
  }
  inProgress: boolean
}
export type State = {
  walletInit: WalletInitState
  walletPhrase: WalletPhraseState
  walletScan: WalletScanState
  password: PasswordState
  isCreated: boolean | null
}

const initialState: State = {
  walletInit: {
    password: '',
    confirmPassword: '',
    mnemonic: '',
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
  walletPhrase: {
    inProgress: false,
    phrase: '',
  },
  password: {
    valid: false,
    value: '',
    error: {
      message: '',
      code: 0,
    },
    inProgress: false,
  },
  isCreated: null,
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
        mnemonic: '',
        error: {
          message: '',
          code: 0,
        },
      }

    case 'WALLET_INIT_SET_IS_NEW':
      return { ...initialState.walletInit, isNew: action.value }

    case 'WALLET_INIT_SET_PASSWORD':
      return { ...state, password: action.password }

    case 'WALLET_INIT_SET_CONFIRM_PASSWORD':
      return { ...state, confirmPassword: action.confirmPassword }

    case 'SEED_NEW_SUCCESS':
      return { ...state, mnemonic: action.mnemonic }

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

    case 'WALLET_SCAN_OUTPUTS_SUCCESS':
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

const walletPhrase = function (
  state: WalletPhraseState = initialState.walletPhrase,
  action: Action,
): WalletPhraseState {
  switch (action.type) {
    case 'WALLET_PHRASE_REQUEST':
      return { ...state, inProgress: true }

    case 'WALLET_PHRASE_SUCCESS':
      return { ...state, inProgress: false, phrase: action.phrase }

    case 'WALLET_PHRASE_FAILURE':
      return { ...state, inProgress: false }

    default:
      return state
  }
}

const password = function (
  state: PasswordState = initialState.password,
  action: Action,
): PasswordState {
  switch (action.type) {
    case 'SET_PASSWORD':
      return {
        valid: false,
        value: action.password,
        error: initialState.password.error,
        inProgress: state.inProgress,
      }

    case 'CHECK_PASSWORD':
      return {
        valid: false,
        value: state.value,
        error: initialState.password.error,
        inProgress: true,
      }

    case 'VALID_PASSWORD':
      return {
        value: state.value,
        valid: true,
        error: initialState.password.error,
        inProgress: false,
      }

    case 'INVALID_PASSWORD':
      return {
        value: '',
        valid: false,
        error: {
          message: 'Wrong password',
        },
        inProgress: false,
      }

    case 'CLEAR_PASSWORD':
      return {
        valid: false,
        error: initialState.password.error,
        value: '',
        inProgress: false,
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
  password,
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
  walletPhrase,
})
export const sideEffects = {
  ['SEED_NEW_REQUEST']: (action: seedNewRequestAction, store: Store) => {
    return WalletBridge.seedNew(action.length)
      .then((mnemonic: string) => {
        store.dispatch({
          type: 'SEED_NEW_SUCCESS',
          mnemonic,
        })
      })
      .catch((error: Error) => {
        store.dispatch({
          type: 'SEED_NEW_FAILURE',
          message: error.message,
        })
        log(error, true)
      })
  },
  ['WALLET_INIT_REQUEST']: async (
    action: walletInitRequestAction,
    store: Store,
  ) => {
    const { password, phrase, isNew } = action
    await checkWalletDataDirectory()
    return WalletBridge.walletInit(
      getStateForRust(store.getState()),
      phrase,
      password,
    )
      .then(() => {
        store.dispatch({
          type: 'SET_PASSWORD',
          password,
        })
        store.dispatch({
          type: 'CHECK_PASSWORD',
          password,
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
      })
      .catch((error: Error) => {
        store.dispatch({
          type: 'WALLET_INIT_FAILURE',
          message: error.message,
        })
        log(error, true)
      })
  },
  ['WALLET_SCAN_FAILURE']: async (action: walletScanFailureAction) => {
    log(action, true)
  },
  ['CLEAR_PASSWORD']: async (_action: clearPasswordAction) => {
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
        JSON.parse(
          await WalletBridge.walletPmmrRange(getStateForRust(store.getState())),
        ),
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
    store.dispatch({
      type: 'WALLET_SCAN_OUTPUTS_REQUEST',
    })
  },
  ['WALLET_SCAN_PMMR_RANGE_FAILURE']: async (
    action: walletScanPmmrRangeFalureAction,
    store: Store,
  ) => {
    const isPasswordSet = !!store.getState().wallet.password.value

    if (!isPasswordSet) {
      return
    }

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
    _action: walletScanOutputsRequestAction,
    store: Store,
  ) => {
    const {
      lastRetrievedIndex,
      highestIndex,
      lowestIndex,
    } = store.getState().wallet.walletScan

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
          getStateForRust(store.getState()),
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
    _action: walletScanOutputsSuccessAction,
    store: Store,
  ) => {
    const {
      lastRetrievedIndex,
      highestIndex,
      pmmrRangeLastUpdated,
    } = store.getState().wallet.walletScan

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
        store.dispatch({
          type: 'WALLET_SCAN_OUTPUTS_REQUEST',
        })
      }
    }
  },
  ['WALLET_SCAN_OUTPUTS_FAILURE']: async (
    action: walletScanOutputsFalureAction,
    store: Store,
  ) => {
    const isPasswordSet = !!store.getState().wallet.password.value

    if (!isPasswordSet) {
      return
    }

    const { message } = action
    const { retryCount } = store.getState().wallet.walletScan

    if (retryCount < MAX_RETRIES) {
      store.dispatch({
        type: 'WALLET_SCAN_OUTPUTS_REQUEST',
      })
    } else {
      store.dispatch({
        type: 'WALLET_SCAN_FAILURE',
        message,
      })
    }
  },
  ['CHECK_PASSWORD']: (action: checkPasswordAction, store: Store) => {
    return WalletBridge.openWallet(
      getStateForRust(store.getState()),
      action.password,
    )
      .then(() => {
        store.dispatch({
          type: 'VALID_PASSWORD',
        })
      })
      .catch(() => {
        setTimeout(() => {
          store.dispatch({
            type: 'INVALID_PASSWORD',
          })
        }, 1000) // Time-out to prevent a bruteforce attack)
      })
  },
  ['CHECK_PASSWORD_FROM_BIOMETRY']: (
    action: checkPasswordFromBiometryAction,
    store: Store,
  ) => {
    return WalletBridge.openWallet(
      getStateForRust(store.getState()),
      action.password,
    )
      .then(() => {
        store.dispatch({
          type: 'SET_PASSWORD',
          password: action.password,
        })
        store.dispatch({
          type: 'VALID_PASSWORD',
        })
      })
      .catch(() => {
        store.dispatch({
          type: 'DISABLE_BIOMETRY_REQUEST',
        })
      })
  },
  ['INVALID_PASSWORD']: (_action: invalidPasswordAction, store: Store) => {
    store.dispatch({
      type: 'TOAST_SHOW',
      text: 'Wrong password',
    })
  },
  ['WALLET_PHRASE_REQUEST']: (
    _action: walletPhraseRequestAction,
    store: Store,
  ) => {
    // return GrinBridge.walletPhrase(getStateForRust(store.getState()), 'her')
    return WalletBridge.walletPhrase(getStateForRust(store.getState()))
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
