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
import {
  type Action,
  type walletInitRequestAction,
  type seedNewRequestAction,
  type walletPhraseRequestAction,
  type invalidPasswordAction,
  type walletDestroyRequestAction,
  type walletDestroySuccessAction,
  type walletMigrateToMainnetRequestAction,
  type walletRepairRequestAction,
  type checkPasswordAction,
  type Store,
} from 'common/types'
import { log } from 'common/logger'
import { combineReducers } from 'redux'
import { getStateForRust, checkWalletDataDirectory } from 'common'
import RNFS from 'react-native-fs'
import { WALLET_DATA_DIRECTORY } from 'common'
import { NavigationActions } from 'react-navigation'

const { GrinBridge } = NativeModules

export type WalletInitState = {|
  inProgress: boolean,
  mnemonic: string,
  password: string,
  confirmPassword: string,
  progress: number,
  created: boolean,
  isNew: boolean,
  error: {
    message: string,
    code?: number,
  },
|}

export type WalletRepairState = {|
  inProgress: boolean,
  progress: number,
  repaired: boolean,
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
  walletRepair: WalletRepairState,
  password: PasswordState,
}

const initialState: State = {
  walletInit: {
    inProgress: false,
    password: '',
    confirmPassword: '',
    mnemonic: '',
    progress: 0,
    created: false,
    isNew: true,
    error: {
      message: '',
      code: 0,
    },
  },
  walletRepair: {
    inProgress: false,
    progress: 0,
    repaired: false,
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
      return initialState.walletInit
    }
    case 'WALLET_DESTROY_SUCCESS': {
      return initialState.walletInit
    }
    case 'WALLET_INIT_REQUEST':
      return {
        ...state,
        inProgress: true,
        progress: 0,
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
    case 'WALLET_INIT_SUCCESS':
      return {
        ...state,
        inProgress: false,
        created: true,
      }
    case 'WALLET_INIT_FAILURE':
      return {
        ...state,
        inProgress: false,
        error: {
          message: action.message,
          code: 0,
        },
      }
    case 'WALLET_RECOVERY_REQUEST':
      return {
        ...state,
        inProgress: true,
        error: {
          message: '',
          code: 0,
        },
      }
    case 'WALLET_RECOVERY_SUCCESS':
      return {
        ...state,
        inProgress: false,
      }
    case 'WALLET_RECOVERY_PROGRESS_UPDATE':
      return {
        progress: action.progress,
        ...state,
      }
    case 'WALLET_RECOVERY_FAILURE':
      return {
        ...state,
        inProgress: false,
        mnemonic: '',
        error: {
          message: action.message,
        },
      }
    case 'WALLET_RECOVERY_SET_PASSWORD':
      return {
        ...state,
        password: action.password,
      }
    case 'WALLET_RECOVERY_SET_MNEMONIC':
      return {
        ...state,
        mnemonic: action.mnemonic,
      }

    default:
      return state
  }
}

const walletRepair = function(
  state: WalletRepairState = initialState.walletRepair,
  action: Action
): WalletRepairState {
  switch (action.type) {
    case 'WALLET_REPAIR_REQUEST':
      return {
        ...state,
        inProgress: true,
        progress: 0,
        repaired: false,
        error: {
          message: '',
          code: 0,
        },
      }
    case 'WALLET_REPAIR_SUCCESS':
      return {
        ...state,
        inProgress: false,
        repaired: true,
      }
    case 'WALLET_REPAIR_FAILURE':
      return {
        ...state,
        inProgress: false,
        error: {
          message: action.message,
          code: 0,
        },
      }
    case 'WALLET_REPAIR_RESET':
      return {
        ...state,
        inProgress: true,
        progress: 0,
        repaired: false,
        error: {
          message: '',
          code: 0,
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
  walletInit,
  walletPhrase,
  walletRepair,
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
  ['WALLET_INIT_REQUEST']: (action: walletInitRequestAction, store: Store) => {
    const { password, phrase, isNew } = action
    return checkWalletDataDirectory().then(() => {
      return GrinBridge.walletInit(getStateForRust(store.getState()), phrase, password, isNew)
        .then(() => {
          store.dispatch({ type: 'WALLET_INIT_SUCCESS' })
          store.dispatch({ type: 'SET_PASSWORD', password })
        })
        .catch(error => {
          store.dispatch({ type: 'WALLET_INIT_FAILURE', message: error.message })
          log(error, true)
        })
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
  ['INVALID_PASSWORD']: (action: invalidPasswordAction, store: Store) => {
    store.dispatch({
      type: 'TOAST_SHOW',
      text: 'Wrong password!',
    })
  },
  ['WALLET_PHRASE_REQUEST']: (action: walletPhraseRequestAction, store: Store) => {
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
        store.dispatch({ type: 'WALLET_DESTROY_SUCCESS' })
      })
    } catch (error) {
      store.dispatch({ type: 'WALLET_PHRASE_FAILURE', message: error.message })
      log(error, true)
    }
  },
  ['WALLET_DESTROY_SUCCESS']: (action: walletDestroySuccessAction, store: Store) => {
    store.dispatch(NavigationActions.navigate({ routeName: 'Initial' }))
  },
  ['WALLET_MIGRATE_TO_MAINNET_REQUEST']: (
    action: walletMigrateToMainnetRequestAction,
    store: Store
  ) => {
    store.dispatch({ type: 'SWITCH_TO_MAINNET' })
    store.dispatch({ type: 'WALLET_DESTROY_REQUEST' })
  },
  ['WALLET_REPAIR_REQUEST']: async (action: walletRepairRequestAction, store: Store) => {
    return GrinBridge.walletRepair(getStateForRust(store.getState()))
      .then(() => {
        store.dispatch({ type: 'WALLET_REPAIR_SUCCESS' })
      })
      .catch(error => {
        store.dispatch({ type: 'WALLET_REPAIR_FAILURE', message: error.message })
        log(error, true)
      })
  },
}
