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
import { ignoreElements, filter, tap, map } from 'rxjs/operators'
import { from,  Observable } from 'rxjs'
import { RootState } from 'src/common/redux'
import { Epic, combineEpics, ofType } from 'redux-observable'
import { Action, valueof } from 'src/common/types'
import { NativeEventEmitter } from 'react-native'
import WalletBridge from 'src/bridges/wallet'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const torBridgeEmitter = new NativeEventEmitter(WalletBridge as any)

const torObservable = new Observable(function (observer) {
  torBridgeEmitter.addListener('TorStatusUpdate', (status) => {
    observer.next(status)
  })

});

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
export type TorActions = valueof<typeof torActions>

export const startTorEpic: Epic<Action, Action, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType('SET_WALLET_OPEN'),
    filter(() => state$.value.tor.status !== TOR_IN_PROGRESS),
    tap(() => {
      WalletBridge.startTor().then().catch(console.error)
    }),
    ignoreElements(),
  )


export const stopTorEpic: Epic<Action, Action, RootState> = (action$) =>
  action$.pipe(
    ofType('CLOSE_WALLET', 'WALLET_DESTROY_SUCCESS'),
    tap(() => {
      WalletBridge.stopTor().then().catch(console.error)
    }),
    map(() => torActions.setStatus(TOR_DISCONNECTED) as  Action),
  )

export const statusUpdates: Epic<Action, Action, RootState> = (_, state$) =>
  from(torObservable).pipe(
    filter((status) => state$.value.tor.status !== status),
    map((status) => torActions.setStatus(status as TorStatus) as Action),
  )

export const torEpic: Epic<Action, Action, RootState> = combineEpics(
  startTorEpic,
  stopTorEpic,
  statusUpdates,
)

export const torStatusSelector = (state: RootState) => state.tor.status
