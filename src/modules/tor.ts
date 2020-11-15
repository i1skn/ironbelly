/**
 * Copyright 2020 Ironbelly Devs
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

import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { ignoreElements, filter, tap, map, mapTo } from 'rxjs/operators'
import { fromEvent } from 'rxjs'
import { RootState } from 'src/common/redux'
import { Epic, combineEpics, ofType } from 'redux-observable'
import { Action } from 'src/common/types'
import { getStateForRust } from 'src/common'
// @ts-ignore
import { NativeModules, NativeEventEmitter } from 'react-native'

const { TorBridge } = NativeModules

const torBridgeEmitter = new NativeEventEmitter(TorBridge)

export const TOR_CONNECTED = 'connected'
export const TOR_IN_PROGRESS = 'in-progress'
export const TOR_FAILED = 'failed'
export const TOR_DISCONNECTED = 'disconnected'

export type TorStatus =
  | typeof TOR_CONNECTED
  | typeof TOR_IN_PROGRESS
  | typeof TOR_FAILED
  | typeof TOR_DISCONNECTED

export type State = {
  status: TorStatus
}
export const initialState: State = {
  status: TOR_DISCONNECTED,
}

const torSlice = createSlice({
  name: 'tor',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<TorStatus>) => {
      state.status = action.payload
    },
  },
})

export const torReducer = torSlice.reducer
export const torActions = torSlice.actions
export type TorActions = typeof torActions.setStatus

export const startTorEpic: Epic<Action, Action, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType('VALID_PASSWORD'),
    filter(
      () =>
        state$.value.wallet.password.valid &&
        state$.value.tor.status !== TOR_IN_PROGRESS,
    ),
    tap(() => {
      TorBridge.startTor(getStateForRust(state$.value))
        .then(console.log)
        .catch(console.error)
    }),
    ignoreElements(),
  )

export const stopTorEpic: Epic<Action, Action, RootState> = (
  action$,
  _state$,
) =>
  action$.pipe(
    ofType('CLEAR_PASSWORD', 'WALLET_DESTROY_SUCCESS'),
    tap(() => {
      TorBridge.stopTor().then(console.log).catch(console.error)
    }),
    mapTo(torActions.setStatus(TOR_DISCONNECTED) as Action),
  )

export const statusUpdates: Epic<Action, Action, RootState> = (_, state$) =>
  fromEvent<string>(torBridgeEmitter, 'TorStatusUpdate').pipe(
    filter((status) => state$.value.tor.status !== status),
    map((status) => torActions.setStatus(status as TorStatus) as Action),
  )

export const torEpic: Epic<Action, Action, RootState> = combineEpics(
  startTorEpic,
  stopTorEpic,
  statusUpdates,
)

export const torStatusSelector = (state: RootState) => state.tor.status
