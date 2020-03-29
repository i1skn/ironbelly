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
import { createMiddleware } from 'src/common/sideEffects'
import AsyncStorage from '@react-native-community/async-storage'
import { combineReducers } from 'redux'
import { reducer as balanceReducer } from 'src/modules/balance'
import { reducer as txReducer, sideEffects as txSideEffects } from 'src/modules/tx'
import { reducer as settingsReducer, sideEffects as settingsEffects } from 'src/modules/settings'
import {
  reducer as currencyRates,
  sideEffects as currencyRatesEffects,
} from 'src/modules/currency-rates'
import { reducer as toasterReducer, sideEffects as toasterEffects } from 'src/modules/toaster'
import { reducer as walletReducer, sideEffects as walletEffects } from 'src/modules/wallet'
import { State, Action } from 'src/common/types'
import { createStore, applyMiddleware } from 'redux'
import { createLogger } from 'redux-logger'
import { createMigrate, persistStore, persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import { migrations } from 'src/common/migrations'
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
export const rootReducer = combineReducers<State, Action>({
  balance: persistReducer(balanceConfig, balanceReducer) as typeof balanceReducer,
  tx: txReducer,
  currencyRates: persistReducer(currencyRatesConfig, currencyRates) as typeof currencyRates,
  settings: settingsReducer,
  toaster: toasterReducer,
  wallet: walletReducer,
}) as () => State

const sideEffects = {
  ...txSideEffects,
  ...walletEffects,
  ...toasterEffects,
  ...settingsEffects,
  ...currencyRatesEffects,
}
const logger = createLogger({})
const sideEffectsMiddleware = createMiddleware(sideEffects)

const persistConfig = {
  key: 'root',
  stateReconciler: autoMergeLevel2,
  storage: AsyncStorage,
  version: 0,
  // default is -1, increment as we make migrations
  whitelist: ['settings'],
  migrate: createMigrate(migrations, {
    debug: true,
  }),
}
const persistedReducer = persistReducer<State, Action>(persistConfig, rootReducer)
export const store = createStore(
  persistedReducer,
  process.env.NODE_ENV === 'development'
    ? applyMiddleware(sideEffectsMiddleware, logger)
    : applyMiddleware(sideEffectsMiddleware),
)
export const persistor = persistStore(store)
