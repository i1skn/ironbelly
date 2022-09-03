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
import { catchError, map, mergeMap } from 'rxjs/operators'
import { from, EMPTY } from 'rxjs'
import { RootState } from 'src/common/redux'
import { Epic, combineEpics, ofType } from 'redux-observable'
import { Action, valueof } from 'src/common/types'
import WalletBridge from 'src/bridges/wallet'

export type State = {
  address: string | undefined
}
export const initialState: State = {
  address: undefined,
}

const txReceiveSlice = createSlice({
  name: 'txReceive',
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string | undefined>) => {
      state.address = action.payload
    },
  },
})

export const txReceiveReducer = txReceiveSlice.reducer
export const txReceiveActions = txReceiveSlice.actions
export type TxReceiveActions = valueof<typeof txReceiveActions>

export const startHttpListenEpic: Epic<Action, Action, RootState> = (action$) =>
  action$.pipe(
    ofType('SET_WALLET_OPEN'),
    mergeMap(() =>
      from(WalletBridge.startListenWithHttp('0.0.0.0:3415')).pipe(
        map(
          (address: string) => txReceiveActions.setAddress(address) as Action,
        ),
        catchError((error) => {
          console.log(error)
          return EMPTY
        }),
      ),
    ),
  )

export const stopHttpListenEpic: Epic<Action, Action, RootState> = (action$) =>
  action$.pipe(
    ofType('CLOSE_WALLET', 'WALLET_DESTROY_SUCCESS'),
    mergeMap(async () => {
      await WalletBridge.stopListenWithHttp()
      return txReceiveActions.setAddress(undefined) as Action
    }),
  )

export const txReceiveEpic: Epic<Action, Action, RootState> = combineEpics(
  startHttpListenEpic,
  stopHttpListenEpic,
)

export const grinAddressSelector = (state: RootState) => state.txReceive.address
