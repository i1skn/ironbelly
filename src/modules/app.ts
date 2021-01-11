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

import { Epic, combineEpics } from 'redux-observable'
import { filter, mapTo } from 'rxjs/operators'
import { Action } from 'src/common/types'
import { RootState } from 'src/common/redux'
import { of, interval } from 'rxjs'

const REFRESH_TXS_INTERVAL = 10 * 1000 // 10 sec

export type State = {
  legalAccepted: boolean
}
export const initialState: State = {
  legalAccepted: false,
}

export const appReducer = (
  state: State = initialState,
  action: Action,
): State => {
  switch (action.type) {
    case 'ACCEPT_LEGAL':
      return {
        ...state,
        legalAccepted: action.value,
      }
    default:
      return state
  }
}

const refreshTxsPeriodicallyEpic: Epic<Action, Action, RootState> = (
  _,
  state$,
) =>
  interval(REFRESH_TXS_INTERVAL).pipe(
    filter(
      () =>
        state$.value.wallet.isOpened &&
        !state$.value.wallet.walletScan.inProgress,
    ),
    mapTo({
      type: 'TX_LIST_REQUEST',
      showLoader: false,
      refreshFromNode: true,
    }),
  )

const checkBiometryEpic: Epic<Action, Action, RootState> = () => {
  return of({
    type: 'CHECK_BIOMETRY_REQUEST',
  })
}

export const appEpic: Epic<Action, Action, RootState> = combineEpics(
  checkBiometryEpic,
  refreshTxsPeriodicallyEpic,
)
