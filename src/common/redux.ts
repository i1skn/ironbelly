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

import {
  TypedUseSelectorHook,
  useSelector as useUntypedSelector,
} from 'react-redux'
import { createMiddleware } from 'src/common/sideEffects'
import AsyncStorage from '@react-native-community/async-storage'
import { combineReducers, compose } from 'redux'
import { Epic, combineEpics, createEpicMiddleware } from 'redux-observable'
import { appEpic, appReducer } from 'src/modules/app'
import { catchError } from 'rxjs/operators'
import { reducer as balanceReducer } from 'src/modules/balance'
import {
  reducer as txReducer,
  sideEffects as txSideEffects,
} from 'src/modules/tx'
import { txReceiveReducer, txReceiveEpic } from 'src/modules/tx/receive'
import {
  reducer as settingsReducer,
  sideEffects as settingsEffects,
} from 'src/modules/settings'
import {
  reducer as currencyRates,
  sideEffects as currencyRatesEffects,
} from 'src/modules/currency-rates'
import {
  reducer as toasterReducer,
  sideEffects as toasterEffects,
} from 'src/modules/toaster'
import {
  reducer as walletReducer,
  sideEffects as walletEffects,
} from 'src/modules/wallet'
import { torReducer, torEpic } from 'src/modules/tor'
import { State, Action } from 'src/common/types'
import { createStore, applyMiddleware } from 'redux'
import { createMigrate, persistStore, persistReducer } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import { migrations } from 'src/common/migrations'

const appConfig = {
  key: 'app',
  stateReconciler: autoMergeLevel2,
  storage: AsyncStorage,
  whitelist: ['legalAccepted'],
}

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
  balance: persistReducer(
    balanceConfig,
    balanceReducer,
  ) as typeof balanceReducer,
  app: persistReducer(appConfig, appReducer) as typeof appReducer,
  tx: txReducer,
  txReceive: txReceiveReducer,
  currencyRates: persistReducer(
    currencyRatesConfig,
    currencyRates,
  ) as typeof currencyRates,
  settings: settingsReducer,
  toaster: toasterReducer,
  wallet: walletReducer,
  tor: torReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export const rootEpic: Epic<Action, Action, State> = (
  action$,
  store$,
  dependencies,
) =>
  combineEpics(appEpic, txReceiveEpic, torEpic)(
    action$,
    store$,
    dependencies,
  ).pipe(
    catchError((error, source) => {
      console.error(error)
      return source
    }),
  )

const sideEffects = {
  ...txSideEffects,
  ...walletEffects,
  ...toasterEffects,
  ...settingsEffects,
  ...currencyRatesEffects,
}
const sideEffectsMiddleware = createMiddleware(sideEffects)
const epicMiddleware = createEpicMiddleware<Action, Action, State>()

const persistConfig = {
  key: 'root',
  stateReconciler: autoMergeLevel2,
  storage: AsyncStorage,
  version: 1,
  // default is -1, increment as we make migrations
  whitelist: ['settings'],
  migrate: createMigrate(migrations, {
    debug: true,
  }),
}

const enhancers = [applyMiddleware(sideEffectsMiddleware, epicMiddleware)]

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const persistedReducer = persistReducer<RootState, Action>(
  persistConfig,
  rootReducer,
)
export const store = createStore(
  persistedReducer,
  composeEnhancers(...enhancers),
)
export const persistor = persistStore(store)

epicMiddleware.run(rootEpic)

export const useSelector: TypedUseSelectorHook<RootState> = useUntypedSelector
