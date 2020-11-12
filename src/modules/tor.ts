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

type TorStatus = 'connected' | 'in-progress' | 'failed' | 'disconnected'

export type State = {
  allowed: boolean
  status: TorStatus
}
export const initialState: State = {
  allowed: false,
  status: 'disconnected',
}

const torSlice = createSlice({
  name: 'tor',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<TorStatus>) => {
      state.status = action.payload
    },
    setAllowed: (state, action: PayloadAction<boolean>) => {
      state.allowed = action.payload
    },
  },
})

export const torReducer = torSlice.reducer
export const torActions = torSlice.actions
export type TorActions =
  | typeof torActions.setAllowed
  | typeof torActions.setStatus

export const startTorEpic: Epic<Action, Action, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType('VALID_PASSWORD', torActions.setAllowed.toString()),
    filter(
      () =>
        !state$.value.tor.allowed &&
        state$.value.wallet.password.valid &&
        state$.value.tor.status !== 'in-progress',
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
    ofType('CLEAR_PASSWORD'),
    tap(() => {
      TorBridge.stopTor().then(console.log).catch(console.error)
    }),
    mapTo(torActions.setStatus('disconnected') as Action),
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
