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

import { type Action, type Store, type checkBiometryRequestAction } from 'common/types'
import { log } from 'common/logger'
import { currencyList } from 'common'

export type State = {|
  rates: Object,
  inProgress: boolean,
  lastUpdated: number, // timestamp
|}

export const initialState: State = {
  rates: {},
  inProgress: false,
  lastUpdated: 0,
}

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case 'CURRENCY_RATES_REQUEST':
      return {
        ...state,
        inProgress: true,
      }
    case 'CURRENCY_RATES_SUCCESS':
      return {
        rates: action.rates['grin'],
        inProgress: false,
        lastUpdated: Date.now(),
      }
    case 'CURRENCY_RATES_FAILURE':
      return {
        ...state,
        inProgress: false,
      }
    default:
      return state
  }
}

export const sideEffects = {
  ['CURRENCY_RATES_REQUEST']: async (action: checkBiometryRequestAction, store: Store) => {
    try {
      const rates = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=grin&vs_currencies=${currencyList
          .map(c => c.code)
          .join(',')}`
      ).then(data => data.json())
      store.dispatch({ type: 'CURRENCY_RATES_SUCCESS', rates })
    } catch (error) {
      store.dispatch({ type: 'CURRENCY_RATES_FAILURE', message: error.message })
    }
  },
}
