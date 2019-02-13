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

import { NativeModules, NativeEventEmitter } from 'react-native'
import {
  type Action,
  type walletInitRequestAction,
  type walletPhraseRequestAction,
  type walletRecoveryRequestAction,
  type Store,
} from 'common/types'
import { log } from 'common/logger'
import { combineReducers } from 'redux'
import { checkWalletDataDirectory, WALLET_DATA_DIRECTORY } from 'common'
import RNFS from 'react-native-fs'

const { GrinBridge } = NativeModules

export type WalletInitState = {
  inProgress: boolean,
  mnemonic: string,
}

export type WalletRecoveryState = {
  inProgress: boolean,
  isRecovered: boolean,
  phrase: string,
  password: string,
  progress: number,
  error: {
    message: string,
    code?: number,
  },
}

export type WalletPhraseState = {
  inProgress: boolean,
  phrase: string,
}

export type State = {
  walletInit: WalletInitState,
  walletRecovery: WalletRecoveryState,
  walletPhrase: WalletPhraseState,
}

const initialState: State = {
  walletInit: {
    inProgress: false,
    mnemonic: '',
  },
  walletPhrase: {
    inProgress: false,
    phrase: '',
  },
  walletRecovery: {
    inProgress: false,
    isRecovered: false,
    progress: 0,
    phrase: '',
    password: '',
    error: {
      message: '',
      code: 0,
    },
  },
}

const walletInit = function(
  state: WalletInitState = initialState.walletInit,
  action: Action
): WalletInitState {
  switch (action.type) {
    case 'WALLET_INIT_REQUEST':
      return {
        ...state,
        inProgress: true,
        progress: 0,
        mnemonic: '',
      }
    case 'WALLET_INIT_SUCCESS':
      return {
        ...state,
        inProgress: false,
        mnemonic: action.mnemonic,
      }
    case 'WALLET_INIT_FAILURE':
      return {
        ...state,
        inProgress: false,
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

const walletRecovery = function(
  state: WalletRecoveryState = initialState.walletRecovery,
  action: Action
): WalletRecoveryState {
  switch (action.type) {
    case 'WALLET_RECOVERY_REQUEST':
      return {
        ...state,
        inProgress: true,
        isRecovered: false,
        error: {
          message: '',
          code: 0,
        },
      }
    case 'WALLET_RECOVERY_SUCCESS':
      return {
        ...state,
        inProgress: false,
        isRecovered: true,
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
        phrase: '',
        error: {
          message: action.message,
        },
      }
    case 'WALLET_RECOVERY_SET_PASSWORD':
      return {
        ...state,
        password: action.password,
      }
    case 'WALLET_RECOVERY_SET_PHRASE':
      return {
        ...state,
        phrase: action.phrase,
      }
    default:
      return state
  }
}

export const reducer = combineReducers({
  walletInit,
  walletRecovery,
  walletPhrase,
})

export const sideEffects = {
  ['WALLET_INIT_REQUEST']: (action: walletInitRequestAction, store: Store) => {
    const { checkNodeApiHttpAddr } = store.getState().settings
    return checkWalletDataDirectory().then(() => {
      return GrinBridge.walletInit('', checkNodeApiHttpAddr)
        .then((mnemonic: string) => {
          store.dispatch({ type: 'WALLET_INIT_SUCCESS', mnemonic })
        })
        .catch(error => {
          const e = JSON.parse(error.message)
          store.dispatch({ type: 'WALLET_INIT_FAILURE', ...e })
          log(e, true)
        })
    })
  },
  ['WALLET_PHRASE_REQUEST']: (action: walletPhraseRequestAction, store: Store) => {
    const { checkNodeApiHttpAddr } = store.getState().settings
    return GrinBridge.walletPhrase('', checkNodeApiHttpAddr)
      .then((phrase: string) => {
        store.dispatch({ type: 'WALLET_PHRASE_SUCCESS', phrase })
      })
      .catch(error => {
        const e = JSON.parse(error.message)
        store.dispatch({ type: 'WALLET_PHRASE_FAILURE', ...e })
        log(e, true)
      })
  },
  ['WALLET_RECOVERY_REQUEST']: (action: walletRecoveryRequestAction, store: Store) => {
    const state = store.getState()
    const { phrase, password } = state.wallet.walletRecovery
    const recoveryEventEmitter = new NativeEventEmitter(GrinBridge)
    const subscription = recoveryEventEmitter.addListener(
      'onRecoveryProgressUpdate',
      ({ progress }) => store.dispatch({ type: 'WALLET_RECOVERY_PROGRESS_UPDATE', progress })
    )
    return checkWalletDataDirectory().then(() => {
      const { checkNodeApiHttpAddr } = store.getState().settings
      return GrinBridge.walletRecovery(phrase, password, checkNodeApiHttpAddr)
        .then(() => {
          subscription.remove()
          store.dispatch({ type: 'WALLET_RECOVERY_SUCCESS' })
          store.dispatch({ type: 'TX_LIST_REQUEST', showLoader: false, refreshFromNode: true })
          store.dispatch({ type: 'BALANCE_REQUEST' })
        })
        .catch(error => {
          subscription.remove()
          const e = JSON.parse(error.message)
          store.dispatch({ type: 'WALLET_RECOVERY_FAILURE', ...e })
          RNFS.unlink(WALLET_DATA_DIRECTORY).then(() => {})
          log(e, true)
        })
    })
  },
}
