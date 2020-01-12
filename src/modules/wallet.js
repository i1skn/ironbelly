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

import { NativeModules } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { persistReducer } from 'redux-persist'
import {
  type Action,
  type walletInitRequestAction,
  type seedNewRequestAction,
  type walletPhraseRequestAction,
  type invalidPasswordAction,
  type walletDestroyRequestAction,
  type walletDestroySuccessAction,
  type walletMigrateToMainnetRequestAction,
  type walletScanRequestAction,
  type checkPasswordAction,
  type checkPasswordFromBiometryAction,
  type Store,
} from 'common/types'
import { log } from 'common/logger'
import { combineReducers } from 'redux'
import { getStateForRust, checkWalletDataDirectory } from 'common'
import RNFS from 'react-native-fs'
import { WALLET_DATA_DIRECTORY } from 'common'
import { NavigationActions } from 'react-navigation'

const { GrinBridge } = NativeModules
export const RECOVERY_LIMIT = 1000

export type WalletInitState = {|
  mnemonic: string,
  password: string,
  confirmPassword: string,
  isNew: boolean,
  error: {
    message: string,
    code?: number,
  },
|}

export type WalletScanState = {|
  inProgress: boolean,
  progress: number,
  isDone: boolean,
  lastRetrievedIndex: number,
  highestIndex: number,
  downloadedInBytes: number,
  error: {
    message: string,
    code?: number,
  },
|}

export type WalletPhraseState = {
  inProgress: boolean,
  phrase: string,
}

export type PasswordState = {
  value: string,
  valid: boolean,
  error: {
    message: string,
    code?: number,
  },
  inProgress: boolean,
}

export type State = {
  walletInit: WalletInitState,
  walletPhrase: WalletPhraseState,
  walletScan: WalletScanState,
  password: PasswordState,
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
    lastRetrievedIndex: 0,
    highestIndex: 0,
    downloadedInBytes: 0,
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
}

const walletInit = function(
  state: WalletInitState = initialState.walletInit,
  action: Action
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
      return {
        ...initialState.walletInit,
        isNew: action.value,
      }
    case 'WALLET_INIT_SET_PASSWORD':
      return {
        ...state,
        password: action.password,
      }
    case 'WALLET_INIT_SET_CONFIRM_PASSWORD':
      return {
        ...state,
        confirmPassword: action.confirmPassword,
      }
    case 'SEED_NEW_SUCCESS':
      return {
        ...state,
        mnemonic: action.mnemonic,
      }
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

const walletScan = function(
  state: WalletScanState = initialState.walletScan,
  action: Action
): WalletScanState {
  switch (action.type) {
    case 'WALLET_SCAN_DONE':
      return {
        ...state,
        progress: 0,
        inProgress: false,
        isDone: true,
        lastRetrievedIndex: 0,
        highestIndex: 0,
        downloadedInBytes: 0,
      }
    case 'WALLET_SCAN_RESET':
      return {
        ...state,
        progress: 0,
        inProgress: false,
        isDone: false,
        lastRetrievedIndex: 0,
        highestIndex: 0,
        downloadedInBytes: 0,
      }
    case 'WALLET_SCAN_REQUEST':
      return {
        ...state,
        inProgress: true,
        error: {
          message: '',
          code: 0,
        },
      }
    case 'WALLET_SCAN_SUCCESS':
      return {
        ...state,
        progress:
          action.highestIndex &&
          Math.floor((action.lastRetrievedIndex * 100) / action.highestIndex),
        lastRetrievedIndex: action.lastRetrievedIndex,
        highestIndex: action.highestIndex,
        downloadedInBytes: action.downloadedInBytes,
      }
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

const walletPhrase = function(
  state: WalletPhraseState = initialState.walletPhrase,
  action: Action
): WalletPhraseState {
  switch (action.type) {
    case 'WALLET_PHRASE_REQUEST':
      return {
        ...state,
        inProgress: true,
      }
    case 'WALLET_PHRASE_SUCCESS':
      return {
        ...state,
        inProgress: false,
        phrase: action.phrase,
      }
    case 'WALLET_PHRASE_FAILURE':
      return {
        ...state,
        inProgress: false,
      }
    default:
      return state
  }
}

const password = function(
  state: PasswordState = initialState.password,
  action: Action
): PasswordState {
  switch (action.type) {
    case 'SET_PASSWORD':
      return {
        valid: false,
        value: action.password,
        error: {},
        inProgress: state.inProgress,
      }
    case 'CHECK_PASSWORD':
      return {
        valid: false,
        value: state.value,
        error: {},
        inProgress: true,
      }
    case 'VALID_PASSWORD':
      return {
        value: state.value,
        valid: true,
        error: {},
        inProgress: false,
      }
    case 'INVALID_PASSWORD':
      return {
        value: '',
        valid: false,
        error: { message: 'Wrong password' },
        inProgress: false,
      }
    case 'CLEAR_PASSWORD':
      return {
        valid: false,
        error: {},
        value: '',
        inProgress: false,
      }
    default:
      return state
  }
}

export const reducer = combineReducers({
  password,
  walletInit: persistReducer(
    {
      key: 'walletInit',
      storage: AsyncStorage,
      whitelist: ['isNew'],
    },
    walletInit
  ),
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
    walletScan
  ),
  walletPhrase,
})

export const sideEffects = {
  ['SEED_NEW_REQUEST']: (action: seedNewRequestAction, store: Store) => {
    return GrinBridge.seedNew(action.length)
      .then((mnemonic: string) => {
        store.dispatch({ type: 'SEED_NEW_SUCCESS', mnemonic })
      })
      .catch(error => {
        store.dispatch({ type: 'SEED_NEW_FAILURE', message: error.message })
        log(error, true)
      })
  },
  ['WALLET_INIT_REQUEST']: async (action: walletInitRequestAction, store: Store) => {
    const { password, phrase, isNew } = action
    await checkWalletDataDirectory()
    return GrinBridge.walletInit(getStateForRust(store.getState()), phrase, password)
      .then(() => {
        store.dispatch({ type: 'WALLET_INIT_SUCCESS' })
        store.dispatch({ type: 'SET_PASSWORD', password })
        if (isNew) {
          store.dispatch({ type: 'WALLET_SCAN_DONE' })
        } else {
          store.dispatch({ type: 'WALLET_SCAN_REQUEST', startIndex: 0, limit: RECOVERY_LIMIT })
        }
      })
      .catch(error => {
        store.dispatch({ type: 'WALLET_INIT_FAILURE', message: error.message })
        log(error, true)
      })
  },
  ['WALLET_SCAN_REQUEST']: async (action: walletScanRequestAction, store: Store) => {
    const { startIndex, limit } = action
    await checkWalletDataDirectory()
    return GrinBridge.walletScan(getStateForRust(store.getState()), startIndex, limit)
      .then(JSON.parse)
      .then(({ lastRetrievedIndex, highestIndex, downloadedInBytes }) => {
        if (lastRetrievedIndex === highestIndex) {
          store.dispatch({
            type: 'WALLET_SCAN_DONE',
          })
        } else {
          store.dispatch({
            type: 'WALLET_SCAN_SUCCESS',
            lastRetrievedIndex,
            highestIndex,
            downloadedInBytes,
          })
        }
      })
      .catch(error => {
        store.dispatch({ type: 'WALLET_SCAN_FAILURE', message: error.message })
        log(error, true)
      })
  },
  ['CHECK_PASSWORD']: (action: checkPasswordAction, store: Store) => {
    const { value } = store.getState().wallet.password
    return GrinBridge.checkPassword(getStateForRust(store.getState()), value)
      .then((mnemonic: string) => {
        store.dispatch({ type: 'VALID_PASSWORD' })
      })
      .catch(error => {
        setTimeout(() => {
          store.dispatch({ type: 'INVALID_PASSWORD' })
        }, 1000) // Time-out to prevent a bruteforce attack)
      })
  },
  ['CHECK_PASSWORD_FROM_BIOMETRY']: (action: checkPasswordFromBiometryAction, store: Store) => {
    return GrinBridge.checkPassword(getStateForRust(store.getState()), action.password)
      .then((mnemonic: string) => {
        store.dispatch({ type: 'SET_PASSWORD', password: action.password })
        store.dispatch({ type: 'VALID_PASSWORD' })
      })
      .catch(error => {
        store.dispatch({ type: 'DISABLE_BIOMETRY_REQUEST' })
      })
  },
  ['INVALID_PASSWORD']: (action: invalidPasswordAction, store: Store) => {
    store.dispatch({
      type: 'TOAST_SHOW',
      text: 'Wrong password',
    })
  },
  ['WALLET_PHRASE_REQUEST']: (action: walletPhraseRequestAction, store: Store) => {
    // return GrinBridge.walletPhrase(getStateForRust(store.getState()), 'her')
    return GrinBridge.walletPhrase(getStateForRust(store.getState()))
      .then((phrase: string) => {
        store.dispatch({ type: 'WALLET_PHRASE_SUCCESS', phrase })
      })
      .catch(error => {
        store.dispatch({ type: 'WALLET_PHRASE_FAILURE', message: error.message })
        log(error, true)
      })
  },
  ['WALLET_DESTROY_REQUEST']: async (action: walletDestroyRequestAction, store: Store) => {
    try {
      await RNFS.unlink(WALLET_DATA_DIRECTORY).then(() => {
        store.dispatch({ type: 'TX_LIST_CLEAR' })
        store.dispatch({ type: 'RESET_BIOMETRY_REQUEST' })
        store.dispatch({ type: 'WALLET_DESTROY_SUCCESS' })
      })
    } catch (error) {
      store.dispatch({ type: 'WALLET_PHRASE_FAILURE', message: error.message })
      log(error, true)
    }
  },
  ['WALLET_DESTROY_SUCCESS']: (action: walletDestroySuccessAction, store: Store) => {
    store.dispatch({ type: 'WALLET_CLEAR' })
    store.dispatch(NavigationActions.navigate({ routeName: 'Initial' }))
  },
  ['WALLET_MIGRATE_TO_MAINNET_REQUEST']: (
    action: walletMigrateToMainnetRequestAction,
    store: Store
  ) => {
    store.dispatch({ type: 'SWITCH_TO_MAINNET' })
    store.dispatch({ type: 'WALLET_DESTROY_REQUEST' })
  },
}
