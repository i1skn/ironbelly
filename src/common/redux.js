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

import { isFSA } from 'flux-standard-action'
import AsyncStorage from '@react-native-community/async-storage'
import { combineReducers } from 'redux'
import { reducer as balanceReducer, sideEffects as balanceSideEffects } from 'modules/balance'
import { reducer as txReducer, sideEffects as txSideEffects } from 'modules/tx'
import { reducer as settingsReducer, sideEffects as settingsEffects } from 'modules/settings'
import {
  reducer as currencyRates,
  sideEffects as currencyRatesEffects,
} from 'modules/currency-rates'
import { reducer as toasterReducer, sideEffects as toasterEffects } from 'modules/toaster'
import { reducer as walletReducer, sideEffects as walletEffects } from 'modules/wallet'
import { type Store, type Action } from 'common/types'
import { createStore, applyMiddleware } from 'redux'
import { createLogger } from 'redux-logger'
import { createMigrate, persistStore, persistReducer } from 'redux-persist'
import { navReducer, navMiddleware } from 'modules/navigation'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import { migrations } from 'common/migrations'

type Effect = (action: any, store: Store) => ?(Action | Promise<?Action>)
type Effects = { [string]: Effect }

const balanceConfig = {
  key: 'balance',
  stateReconciler: autoMergeLevel2,
  storage: AsyncStorage,
  whitelist: ['data'],
}

const currencyRatesConfig = {
  key: 'currencyRates',
  stateReconciler: autoMergeLevel2,
  storage: AsyncStorage,
  whitelist: ['rates', 'lastUpdated'],
}

export const rootReducer = combineReducers({
  balance: persistReducer(balanceConfig, balanceReducer),
  tx: txReducer,
  currencyRates: persistReducer(currencyRatesConfig, currencyRates),
  settings: settingsReducer,
  toaster: toasterReducer,
  wallet: walletReducer,
  nav: navReducer,
})

const createMiddleware = (effects: Effects) => (store: Store) => (next: any) => (
  action: Action
) => {
  const initAction = next(action)
  const effect = effects[action.type]
  if (effect) {
    const result = effect(action, store)
    if (result && !(result instanceof Promise) && isFSA(result)) {
      store.dispatch(result)
    } else if (result instanceof Promise) {
      result.then(res => res && isFSA(res) && store.dispatch(res))
    }
  }
  return initAction
}
const sideEffects = {
  ...balanceSideEffects,
  ...txSideEffects,
  ...walletEffects,
  ...toasterEffects,
  ...settingsEffects,
  ...currencyRatesEffects,
}

const logger = createLogger({ stateTransformer: () => {} })
const sideEffectsMiddleware = createMiddleware(sideEffects)

const persistConfig = {
  key: 'root',
  stateReconciler: autoMergeLevel2,
  storage: AsyncStorage,
  version: 0, // default is -1, increment as we make migrations
  whitelist: ['settings'],
  migrate: createMigrate(migrations, { debug: true }),
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(
  persistedReducer,
  applyMiddleware(navMiddleware, sideEffectsMiddleware, logger)
)
export const persistor = persistStore(store)
