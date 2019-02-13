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
import { combineReducers } from 'redux'
import { reducer as balanceReducer, sideEffects as balanceSideEffects } from 'modules/balance'
import { reducer as txReducer, sideEffects as txSideEffects } from 'modules/tx'
import { reducer as settingsReducer } from 'modules/settings'
import { reducer as toasterReducer } from 'modules/toaster'
import { reducer as walletReducer, sideEffects as walletEffects } from 'modules/wallet'
import { type Store, type Action, type PromiseAction } from 'common/types'
import { createStore, applyMiddleware } from 'redux'
import { createLogger } from 'redux-logger'

type Effect = (action: any, store: Store) => Action | PromiseAction
type Effects = { [string]: Effect }

export const rootReducer = combineReducers({
  balance: balanceReducer,
  tx: txReducer,
  settings: settingsReducer,
  toaster: toasterReducer,
  wallet: walletReducer,
})

const createMiddleware = (effects: Effects) => (store: Store) => (next: any) => (
  action: Action
) => {
  const initAction = next(action)
  const effect = effects[action.type]
  if (effect) {
    const result = effect(action, store)
    if (!(result instanceof Promise) && isFSA(result)) {
      store.dispatch(result)
    } else if (result instanceof Promise) {
      result.then(res => isFSA(res) && store.dispatch(res))
    }
  }
  return initAction
}
const sideEffects = {
  ...balanceSideEffects,
  ...txSideEffects,
  ...walletEffects,
}

const logger = createLogger({})
const sideEffectsMiddleware = createMiddleware(sideEffects)

export const store = createStore(rootReducer, applyMiddleware(sideEffectsMiddleware, logger))
