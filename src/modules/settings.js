// @flow
//
// Copyright 2019 Ivan Sorokin.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  type Action,
  type Store,
  type Currency,
  type switchToFloonetAction,
  type switchToMainnetAction,
  type setApiSecretAction,
  type enableBiometryRequestAction,
  type checkBiometryRequestAction,
  type disableBiometryRequestAction,
  type resetBiometryRequestAction,
} from 'common/types'
import RNFS from 'react-native-fs'
import { APPLICATION_SUPPORT_DIRECTORY } from 'common'
import * as Keychain from 'react-native-keychain'
import { log } from 'common/logger'
import TouchID from 'react-native-touch-id'
import { getBiometryTitle } from 'common'
import { isAndroid, currencyList } from 'common'

export const BIOMETRY_STATUS = {
  unknown: 'unknown',
  disabled: 'disabled',
  enabled: 'enabled',
}

export type State = {
  currencyObject: Currency,
  checkNodeApiHttpAddr: string,
  chain: 'floonet' | 'mainnet',
  minimumConfirmations: number,
  biometryStatus: 'unknown' | 'disabled' | 'enabled',
  biometryType: ?string,
}

export const MAINNET_CHAIN = 'mainnet'
export const MAINNET_API_SECRET = 'H2vnwhAjhhTAVEYgNRen'
export const MAINNET_DEFAULT_NODE = 'http://grinnode.cycle42.com:3413'
export const MAINNET_DEFAULT_NODE_V2 = 'http://grinnode.cycle42.com:23413'

export const FLOONET_CHAIN = 'floonet'
export const FLOONET_API_SECRET = 'ac9rOHFKASTRzZ4SNJun'
export const FLOONET_DEFAULT_NODE = 'http://floonode.cycle42.com:13413'

export const initialState: State = {
  currencyObject: currencyList[8], // USD
  checkNodeApiHttpAddr: MAINNET_DEFAULT_NODE,
  chain: MAINNET_CHAIN,
  minimumConfirmations: 10,
  biometryStatus: 'unknown',
  biometryType: null,
}

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case 'SET_SETTINGS':
      return {
        ...state,
        ...action.newSettings,
      }
    case 'SWITCH_TO_MAINNET':
      return {
        ...state,
        chain: MAINNET_CHAIN,
        checkNodeApiHttpAddr: MAINNET_DEFAULT_NODE,
        minimumConfirmations: 10,
      }
    case 'SWITCH_TO_FLOONET':
      return {
        ...state,
        checkNodeApiHttpAddr: FLOONET_DEFAULT_NODE,
        chain: FLOONET_CHAIN,
        minimumConfirmations: 1,
      }
    case 'ENABLE_BIOMETRY_SUCCESS':
      return {
        ...state,
        biometryStatus: BIOMETRY_STATUS.enabled,
      }
    case 'ENABLE_BIOMETRY_FAILURE':
      return {
        ...state,
        biometryStatus: BIOMETRY_STATUS.disabled,
      }
    case 'DISABLE_BIOMETRY_SUCCESS':
      return {
        ...state,
        biometryStatus: BIOMETRY_STATUS.disabled,
      }
    case 'RESET_BIOMETRY_SUCCESS':
      return {
        ...state,
        biometryStatus: BIOMETRY_STATUS.unknown,
      }
    case 'CHECK_BIOMETRY_SUCCESS':
      return {
        ...state,
        biometryType: action.biometryType,
      }
    default:
      return state
  }
}

export const apiSecretFilePath = APPLICATION_SUPPORT_DIRECTORY + '/.api_secret'

export const sideEffects = {
  ['SWITCH_TO_FLOONET']: async (action: switchToFloonetAction, store: Store) => {
    await RNFS.writeFile(apiSecretFilePath, FLOONET_API_SECRET)
  },
  ['SWITCH_TO_MAINNET']: async (action: switchToMainnetAction, store: Store) => {
    await RNFS.writeFile(apiSecretFilePath, MAINNET_API_SECRET)
  },
  ['SET_API_SECRET']: async (action: setApiSecretAction, store: Store) => {
    await RNFS.writeFile(apiSecretFilePath, action.apiSecret)
  },
  ['CHECK_BIOMETRY_REQUEST']: async (action: checkBiometryRequestAction, store: Store) => {
    try {
      const biometryType = await Keychain.getSupportedBiometryType()
      store.dispatch({ type: 'CHECK_BIOMETRY_SUCCESS', biometryType })
    } catch (error) {
      store.dispatch({ type: 'CHECK_BIOMETRY_FAILURE', message: error.message })
      log(error, true)
    }
  },
  ['ENABLE_BIOMETRY_REQUEST']: async (action: enableBiometryRequestAction, store: Store) => {
    const { value: password } = store.getState().wallet.password
    try {
      if (
        isAndroid ||
        (await Keychain.canImplyAuthentication({
          authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
        }))
      ) {
        await TouchID.authenticate(
          `Unlock this wallet in the future with ${getBiometryTitle(
            store.getState().settings.biometryType
          )}`,
          { passcodeFallback: false, fallbackLabel: '' }
        )

        await Keychain.setGenericPassword('user', password, {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
          accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
        })
        store.dispatch({ type: 'ENABLE_BIOMETRY_SUCCESS' })
      }
    } catch (error) {
      store.dispatch({ type: 'ENABLE_BIOMETRY_FAILURE', message: error.message })
      log(error, false)
    }
  },
  ['DISABLE_BIOMETRY_REQUEST']: async (action: disableBiometryRequestAction, store: Store) => {
    try {
      await Keychain.resetGenericPassword()
      store.dispatch({ type: 'DISABLE_BIOMETRY_SUCCESS' })
    } catch (error) {
      store.dispatch({ type: 'DISABLE_BIOMETRY_FAILURE', message: error.message })
      log(error, true)
    }
  },
  ['RESET_BIOMETRY_REQUEST']: async (action: resetBiometryRequestAction, store: Store) => {
    try {
      await Keychain.resetGenericPassword()
      store.dispatch({ type: 'RESET_BIOMETRY_SUCCESS' })
    } catch (error) {
      store.dispatch({ type: 'RESET_BIOMETRY_FAILURE', message: error.message })
      log(error, true)
    }
  },
}
