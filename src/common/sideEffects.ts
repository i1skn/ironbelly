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

import { Store, Action, Dispatch } from 'src/common/types'

type ProbablyAction = Action | null | undefined
type Effect = (a: Action, s: Store) => ProbablyAction | Promise<ProbablyAction>
type Effects = {
  [x: string]: Effect
}

const isAction = (o: ProbablyAction): boolean => {
  return !!o?.type
}

export const createMiddleware = (effects: Effects) => (store: Store) => (
  next: Dispatch,
) => (action: Action) => {
  const effect = effects[action.type]
  if (effect) {
    const result = effect(action, store)

    if (result instanceof Promise) {
      result.then((res) => res && isAction(res) && store.dispatch(res))
    } else if (result && isAction(result)) {
      store.dispatch(result)
    }
  }

  return next(action)
}
