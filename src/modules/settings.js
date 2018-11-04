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

import { type Action, type Currency } from 'common/types'

export type State = {
  currency: Currency,
  checkNodeApiHttpAddr: string,
}

const initialState: State = {
  currency: 'USD',
  checkNodeApiHttpAddr: 'http://floonode.cycle42.com:13413',
}

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case 'SET_SETTINGS':
      return {
        ...state,
        ...action.newSettings,
      }
    default:
      return state
  }
}
