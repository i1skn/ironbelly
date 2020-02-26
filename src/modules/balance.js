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

import { NativeModules } from 'react-native'
import moment from 'moment'
import { getStateForRust, mapRustBalance } from 'common'
import { type Action, type Store, type Balance, type RustBalance, type Error } from 'common/types'
import { log } from 'common/logger'

const { GrinBridge } = NativeModules

export type State = Balance

const initialState: State = {
  amountAwaitingConfirmation: 0,
  amountCurrentlySpendable: 0,
  amountImmature: 0,
  amountLocked: 0,
  lastConfirmedHeight: 0,
  minimumConfirmations: 0,
  total: 0,
}

export const reducer = (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case 'TX_LIST_SUCCESS':
      return {
        ...state,
        ...mapRustBalance(action.balance),
      }
    default:
      return state
  }
}
