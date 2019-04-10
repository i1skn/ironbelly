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

import {
  type Action,
  type Store,
  type Currency,
  type switchToFloonetAction,
  type switchToMainnetAction,
  type setApiSecretAction,
} from 'common/types'
import RNFS from 'react-native-fs'
import { APPLICATION_SUPPORT_DIRECTORY } from 'common'

export type State = {
  currency: Currency,
  checkNodeApiHttpAddr: string,
  chain: 'floonet' | 'mainnet',
  minimumConfirmations: number,
  acceptedLegalDisclaimerBuildNumber: number,
}

export const MAINNET_CHAIN = 'mainnet'
export const MAINNET_API_SECRET = 'H2vnwhAjhhTAVEYgNRen'
export const MAINNET_DEFAULT_NODE = 'http://grinnode.cycle42.com:3413'

export const FLOONET_CHAIN = 'floonet'
export const FLOONET_API_SECRET = 'ac9rOHFKASTRzZ4SNJun'
export const FLOONET_DEFAULT_NODE = 'http://floonode.cycle42.com:13413'

export const initialState: State = {
  currency: 'USD',
  checkNodeApiHttpAddr: FLOONET_DEFAULT_NODE,
  chain: FLOONET_CHAIN,
  minimumConfirmations: 1,
  acceptedLegalDisclaimerBuildNumber: 0,
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
      return initialState
    case 'ACCEPT_LEGAL_DISCLAIMER':
      return {
        ...state,
        acceptedLegalDisclaimerBuildNumber: action.buildNumber,
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
}
