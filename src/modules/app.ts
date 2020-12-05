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

import { Epic, combineEpics, ofType } from 'redux-observable'
import {
  filter,
  ignoreElements,
  catchError,
  mergeMap,
  tap,
  mapTo,
} from 'rxjs/operators'
import { interval } from 'rxjs'
import RNFS from 'react-native-fs'
import { Action, Slate, State as RootState } from 'src/common/types'
import { getNavigation } from 'src/modules/navigation'
import { getStateForRust, isResponseSlate } from 'src/common'
import { of, partition, merge } from 'rxjs'
import { log } from 'src/common/logger'
import WalletBridge from 'src/bridges/wallet'

const REFRESH_TXS_INTERVAL = 10 * 1000 // 10 sec

export type State = {
  unopenedSlatePath: string
  legalAccepted: boolean
}
export const initialState: State = {
  unopenedSlatePath: '',
  legalAccepted: false,
}

export const appReducer = (
  state: State = initialState,
  action: Action,
): State => {
  switch (action.type) {
    case 'SLATE_LOAD_REQUEST':
      return {
        ...state,
        unopenedSlatePath: action.slatePath,
      }
    case 'SLATE_LOAD_SUCCESS':
      return {
        ...state,
        unopenedSlatePath: '',
      }
    case 'ACCEPT_LEGAL':
      return {
        ...state,
        legalAccepted: action.value,
      }
    default:
      return state
  }
}

export const handleOpenSlateEpic: Epic<Action, Action, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType('VALID_PASSWORD', 'SLATE_LOAD_REQUEST'),
    filter(
      () =>
        !!state$.value.app.unopenedSlatePath &&
        state$.value.wallet.password.valid,
    ),
    mergeMap(async () => {
      const slatepack: string = await RNFS.readFile(
        state$.value.app.unopenedSlatePath,
        'utf8',
      )
      const slate: Slate = await WalletBridge.slatepackDecode(
        getStateForRust(state$.value),
        slatepack,
      ).then((json: string) => JSON.parse(json))
      return {
        type: 'SLATE_LOAD_SUCCESS',
        slatepack,
        slate,
        slatePath: state$.value.app.unopenedSlatePath,
      } as Action
    }),
    catchError((error) => {
      log(error, true)
      return of({
        type: 'SLATE_SET_FAILURE',
        code: 1,
        message: error.message,
      } as Action)
    }),
  )

export const handleOpenedSlateEpic: Epic<Action, Action, RootState> = (
  action$,
  state$,
) => {
  const [response$, request$] = partition(
    action$.pipe(
      filter(({ type }) => type === 'SLATE_LOAD_SUCCESS'),
      mergeMap(async (action) => {
        // @ts-ignore
        const { slate } = action
        const isResponse = await isResponseSlate(slate)
        return { ...action, isResponse }
      }),
    ),
    ({ isResponse }) => isResponse,
  )
  const combined$ = merge(
    request$.pipe(
      // @ts-ignore
      tap(async ({ slatepack }) => {
        const navigation = await getNavigation()
        navigation?.navigate('TxIncompleteReceive', { slatepack })
      }),
      ignoreElements(),
    ),
    response$.pipe(
      // @ts-ignore
      tap(async ({ slate, slatepack }) => {
        const navigation = await getNavigation()
        const tx = state$.value.tx.list.data.find(
          (tx) => tx.slateId === slate.id,
        )
        navigation?.navigate('TxIncompleteSend', { tx, slatepack })
      }),
      ignoreElements(),
    ),
  )

  return combined$
}

const checkBiometryEpic: Epic<Action, Action, RootState> = () => {
  return of({
    type: 'CHECK_BIOMETRY_REQUEST',
  })
}

const refreshTxsPeriodicallyEpic: Epic<Action, Action, RootState> = (
  _,
  state$,
) =>
  interval(REFRESH_TXS_INTERVAL).pipe(
    filter(() => state$.value.wallet.password.valid),
    mapTo({
      type: 'TX_LIST_REQUEST1',
      showLoader: false,
      refreshFromNode: true,
    }),
  )

export const appEpic: Epic<Action, Action, RootState> = combineEpics(
  checkBiometryEpic,
  handleOpenSlateEpic,
  handleOpenedSlateEpic,
  refreshTxsPeriodicallyEpic,
)
