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
import { type Store, type Action } from 'common/types'
type Effects = { [string]: (a: Action, s: Store) => Action }
export const createMiddleware = (effects: Effects) => (store: Store) => (next: any) => (
  action: Action
) => {
  const initAction = next(action)
  const effect = effects[action.type]
  if (effect) {
    const result = effect(action, store)
    if (isFSA(result)) {
      store.dispatch(result)
    } else if (result instanceof Promise) {
      result.then(res => isFSA(res) && store.dispatch(res))
    }
  }
  return initAction
}
