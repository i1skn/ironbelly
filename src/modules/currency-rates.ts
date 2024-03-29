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

import { Action, Store, currencyRatesRequestAction } from 'src/common/types'
import { currencyList } from 'src/common'
export type State = {
  rates: Record<string, number>
  inProgress: boolean
  lastUpdated: number
  disabled: boolean
}
export const initialState: State = {
  rates: {},
  inProgress: false,
  lastUpdated: 0,
  disabled: false,
}
export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case 'CURRENCY_RATES_REQUEST':
      return { ...state, inProgress: true }

    case 'CURRENCY_RATES_SUCCESS':
      return {
        ...state,
        rates: action.rates.grin,
        inProgress: false,
        lastUpdated: Date.now(),
      }
    case 'CURRENCY_RATES_TOGGLE':
      return {
        ...state,
        disabled: !state.disabled,
      }

    case 'CURRENCY_RATES_FAILURE':
      return { ...state, inProgress: false }

    default:
      return state
  }
}
export const sideEffects = {
  ['CURRENCY_RATES_REQUEST']: async (
    _action: currencyRatesRequestAction,
    store: Store,
  ) => {
    try {
      const rates = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=grin&vs_currencies=${currencyList
          .map((c) => c.code)
          .join(',')}`,
      ).then((data) => data.json())
      store.dispatch({
        type: 'CURRENCY_RATES_SUCCESS',
        rates,
      })
    } catch (error) {
      store.dispatch({
        type: 'CURRENCY_RATES_FAILURE',
        message: error.message,
      })
    }
  },
}
