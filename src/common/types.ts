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

import { State as SettingsState } from 'src/modules/settings'
import { RootStackParamList } from 'src/modules/navigation'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'

// reduxjs/toolkit

import { TxReceiveActions } from 'src/modules/tx/receive'
import { TorActions } from 'src/modules/tor'
import { RootState } from './redux'

export type txListRequestAction = {
  type: 'TX_LIST_REQUEST'
  showLoader: boolean
  refreshFromNode: boolean
}
export type txListClearAction = {
  type: 'TX_LIST_CLEAR'
}
export type txListSuccessAction = {
  type: 'TX_LIST_SUCCESS'
  data: Array<Tx>
  balance: RustBalance
  isRefreshed: boolean
}
export type txListFailureAction = {
  type: 'TX_LIST_FAILURE'
  code?: number
  message: string
}
export type txGetRequestAction = {
  type: 'TX_GET_REQUEST'
  txSlateId: string
}
export type txGetSuccessAction = {
  type: 'TX_GET_SUCCESS'
  tx: RustTx
  isRefreshed: boolean
}
export type txGetFalureAction = {
  type: 'TX_GET_FAILURE'
  code?: number
  message: string
}
export type txCancelRequestAction = {
  type: 'TX_CANCEL_REQUEST'
  id: number
  slateId: string
  isResponse: boolean
}
export type txCancelSuccessAction = {
  type: 'TX_CANCEL_SUCCESS'
}
export type txCancelFalureAction = {
  type: 'TX_CANCEL_FAILURE'
  code: number
  message: string
}
export type txCreateRequestAction = {
  type: 'TX_CREATE_REQUEST'
  amount: number
  selectionStrategyIsUseAll: boolean
}
export type txCreateSuccessAction = {
  type: 'TX_CREATE_SUCCESS'
}
export type txCreateFalureAction = {
  type: 'TX_CREATE_FAILURE'
  code?: number
  message: string
}
export type txSendHttpsRequestAction = {
  type: 'TX_SEND_HTTPS_REQUEST'
  amount: number
  selectionStrategyIsUseAll: boolean
  url: string
}
export type txSendHttpsSuccessAction = {
  type: 'TX_SEND_HTTPS_SUCCESS'
}
export type txSendHttpsFalureAction = {
  type: 'TX_SEND_HTTPS_FAILURE'
  code?: number
  message: string
}
export type txSendAddressRequestAction = {
  type: 'TX_SEND_ADDRESS_REQUEST'
  amount: number
  selectionStrategyIsUseAll: boolean
  address: string
}
export type txSendAddressSuccessAction = {
  type: 'TX_SEND_ADDRESS_SUCCESS'
}
export type txSendAddressFalureAction = {
  type: 'TX_SEND_ADDRESS_FAILURE'
  code?: number
  message: string
}

export type txPostShowAction = {
  type: 'TX_POST_SHOW'
  txSlateId: string
}
export type txPostCloseAction = {
  type: 'TX_POST_CLOSE'
}
export type txPostRequestAction = {
  type: 'TX_POST_REQUEST'
  txSlateId: string
}
export type txPostSuccessAction = {
  type: 'TX_POST_SUCCESS'
}
export type txPostFalureAction = {
  type: 'TX_POST_FAILURE'
  code?: number
  message: string
}
export type setSettingsAction = {
  type: 'SET_SETTINGS'
  newSettings: { [k in keyof SettingsState]?: SettingsState[k] }
}
export type switchToMainnetAction = {
  type: 'SWITCH_TO_MAINNET'
}
export type switchToFloonetAction = {
  type: 'SWITCH_TO_FLOONET'
}
export type enableBiometryRequestAction = {
  type: 'ENABLE_BIOMETRY_REQUEST'
}
export type enableBiometrySuccessAction = {
  type: 'ENABLE_BIOMETRY_SUCCESS'
}
export type enableBiometryFalureAction = {
  type: 'ENABLE_BIOMETRY_FAILURE'
  code?: number
  message: string
}
export type disableBiometryRequestAction = {
  type: 'DISABLE_BIOMETRY_REQUEST'
}
export type disableBiometrySuccessAction = {
  type: 'DISABLE_BIOMETRY_SUCCESS'
}
export type disableBiometryFalureAction = {
  type: 'DISABLE_BIOMETRY_FAILURE'
  code?: number
  message: string
}
export type resetBiometryRequestAction = {
  type: 'RESET_BIOMETRY_REQUEST'
}
export type resetBiometrySuccessAction = {
  type: 'RESET_BIOMETRY_SUCCESS'
}
export type resetBiometryFalureAction = {
  type: 'RESET_BIOMETRY_FAILURE'
  code?: number
  message: string
}
export type checkBiometryRequestAction = {
  type: 'CHECK_BIOMETRY_REQUEST'
}
export type checkBiometrySuccessAction = {
  type: 'CHECK_BIOMETRY_SUCCESS'
  biometryType: string | undefined | null
}
export type checkBiometryFalureAction = {
  type: 'CHECK_BIOMETRY_FAILURE'
  code?: number
  message: string
}
export type setApiSecretAction = {
  type: 'SET_API_SECRET'
  apiSecret: string
}

export type setWalletOpenction = {
  type: 'SET_WALLET_OPEN'
}
export type closeWalletAction = {
  type: 'CLOSE_WALLET'
}
export type slateSetRequestAction = {
  type: 'SLATE_SET_REQUEST'
  id: string
  slatepack: string
  isResponse: boolean
}
export type slateSetSuccessAction = {
  type: 'SLATE_SET_SUCCESS'
}
export type slateSetFalureAction = {
  type: 'SLATE_SET_FAILURE'
  code?: number
  message: string
}
export type slateRemoveRequestAction = {
  type: 'SLATE_REMOVE_REQUEST'
  id: string
  isResponse: boolean
}
export type slateRemoveSuccessAction = {
  type: 'SLATE_REMOVE_SUCCESS'
}
export type slateRemoveFalureAction = {
  type: 'SLATE_REMOVE_FAILURE'
  code?: number
  message: string
}
export type txReceiveRequestAction = {
  type: 'TX_RECEIVE_REQUEST'
  slatepack: string
}
export type txReceiveSuccessAction = {
  type: 'TX_RECEIVE_SUCCESS'
}
export type txReceiveFalureAction = {
  type: 'TX_RECEIVE_FAILURE'
  code?: number
  message: string
}
export type txFinalizeRequestAction = {
  type: 'TX_FINALIZE_REQUEST'
  slatepack: string
}
export type txFinalizeSuccessAction = {
  type: 'TX_FINALIZE_SUCCESS'
}
export type txFinalizeFalureAction = {
  type: 'TX_FINALIZE_FAILURE'
  code?: number
  message: string
}
export type walletClear = {
  type: 'WALLET_CLEAR'
}
export type walletInitRequestAction = {
  type: 'WALLET_INIT_REQUEST'
  password: string
  phrase: string
  isNew: boolean
}
export type walletInitSuccessAction = {
  type: 'WALLET_INIT_SUCCESS'
}
export type walletInitFalureAction = {
  type: 'WALLET_INIT_FAILURE'
  code?: number
  message: string
}
export type walletInitSetIsNewAction = {
  type: 'WALLET_INIT_SET_IS_NEW'
  value: boolean
}
export type walletScanStartAction = {
  type: 'WALLET_SCAN_START'
}
export type walletScanDoneAction = {
  type: 'WALLET_SCAN_DONE'
}
export type walletScanResetAction = {
  type: 'WALLET_SCAN_RESET'
}
export type walletScanFailureAction = {
  type: 'WALLET_SCAN_FAILURE'
  code?: number
  message: string
}
export type walletScanPmmrRangeRequestAction = {
  type: 'WALLET_SCAN_PMMR_RANGE_REQUEST'
}
export type walletScanPmmrRangeSuccessAction = {
  type: 'WALLET_SCAN_PMMR_RANGE_SUCCESS'
  range: PmmrRange
}
export type walletScanPmmrRangeFalureAction = {
  type: 'WALLET_SCAN_PMMR_RANGE_FAILURE'
  code?: number
  message: string
}
export type walletScanOutputsRequestAction = {
  type: 'WALLET_SCAN_OUTPUTS_REQUEST'
}
export type walletScanOutputsSuccessAction = {
  type: 'WALLET_SCAN_OUTPUTS_SUCCESS'
  lastRetrievedIndex: number
}
export type walletScanOutputsFalureAction = {
  type: 'WALLET_SCAN_OUTPUTS_FAILURE'
  code?: number
  message: string
}
export type walletPhraseRequestAction = {
  type: 'WALLET_PHRASE_REQUEST'
  password: string
}
export type walletPhraseSuccessAction = {
  type: 'WALLET_PHRASE_SUCCESS'
  phrase: string
}
export type walletPhraseFalureAction = {
  type: 'WALLET_PHRASE_FAILURE'
  code?: number
  message: string
}
export type walletDestroyRequestAction = {
  type: 'WALLET_DESTROY_REQUEST'
}
export type walletDestroySuccessAction = {
  type: 'WALLET_DESTROY_SUCCESS'
}
export type walletDestroyFalureAction = {
  type: 'WALLET_DESTROY_FAILURE'
  code?: number
  message: string
}
export type walletMigrateToMainnetRequestAction = {
  type: 'WALLET_MIGRATE_TO_MAINNET_REQUEST'
}
export type walletMigrateToMainnetSuccessAction = {
  type: 'WALLET_MIGRATE_TO_MAINNET_SUCCESS'
}
export type walletMigrateToMainnetFalureAction = {
  type: 'WALLET_MIGRATE_TO_MAINNET_FAILURE'
  code?: number
  message: string
}
export type toastShowAction = {
  type: 'TOAST_SHOW'
  text: string
  duration?: number
}
export type toastClearAction = {
  type: 'TOAST_CLEAR'
}
export type txFormSetFromLinkAction = {
  type: 'TX_FORM_SET_FROM_LINK'
  amount: number
  message: string
  url: string
  textAmount: string
}
export type txFormSetAmountAction = {
  type: 'TX_FORM_SET_AMOUNT'
  amount: number
  textAmount: string
}
export type txFormSetAddressAction = {
  type: 'TX_FORM_SET_ADDRESS'
  address: string
}
export type txFormSetOutputStrategyAction = {
  type: 'TX_FORM_SET_OUTPUT_STRATEGY'
  outputStrategy: OutputStrategy
}
export type txFormOutputStrategiesRequestAction = {
  type: 'TX_FORM_OUTPUT_STRATEGIES_REQUEST'
  amount: number
}
export type txFormOutputStrategiesSuccessAction = {
  type: 'TX_FORM_OUTPUT_STRATEGIES_SUCCESS'
  outputStrategies: Array<RustOutputStrategy>
}
export type txFormOutputStrategiesFalureAction = {
  type: 'TX_FORM_OUTPUT_STRATEGIES_FAILURE'
  code?: number
  message: string
}
export type txFormSetMessageAction = {
  type: 'TX_FORM_SET_MESSAGE'
  message: string
}
export type txFormResetAction = {
  type: 'TX_FORM_RESET'
}
export type currencyRatesRequestAction = {
  type: 'CURRENCY_RATES_REQUEST'
}
export type currencyRatesSuccessAction = {
  type: 'CURRENCY_RATES_SUCCESS'
  rates: { [x: string]: Record<string, number> }
}

export type currencyRatesToggleAction = {
  type: 'CURRENCY_RATES_TOGGLE'
}

export type currencyRatesFalureAction = {
  type: 'CURRENCY_RATES_FAILURE'
  code?: number
  message: string
}

export type walletExistsRequestAction = { type: 'WALLET_EXISTS_REQUEST' }
export type walletExistsSuccessAction = {
  type: 'WALLET_EXISTS_SUCCESS'
  exists: boolean
}
export type walletExistsFalureAction = {
  type: 'WALLET_EXISTS_FAILURE'
  code?: number
  message: string
}

export type acceptLegal = { type: 'ACCEPT_LEGAL'; value: boolean }

export type Action =
  | acceptLegal
  | txListClearAction
  | txListRequestAction
  | txListSuccessAction
  | txListFailureAction
  | txGetRequestAction
  | txGetSuccessAction
  | txGetFalureAction
  | txCancelRequestAction
  | txCancelSuccessAction
  | txCancelFalureAction
  | txCreateRequestAction
  | txCreateSuccessAction
  | txCreateFalureAction
  | txSendHttpsRequestAction
  | txSendAddressRequestAction
  | txSendAddressSuccessAction
  | txSendAddressFalureAction
  | txSendHttpsSuccessAction
  | txSendHttpsFalureAction
  | txPostShowAction
  | txPostCloseAction
  | txPostRequestAction
  | txPostSuccessAction
  | txPostFalureAction
  | setSettingsAction
  | switchToMainnetAction
  | switchToFloonetAction
  | enableBiometryRequestAction
  | enableBiometrySuccessAction
  | enableBiometryFalureAction
  | disableBiometryRequestAction
  | disableBiometrySuccessAction
  | disableBiometryFalureAction
  | resetBiometryRequestAction
  | resetBiometrySuccessAction
  | resetBiometryFalureAction
  | checkBiometryRequestAction
  | checkBiometrySuccessAction
  | checkBiometryFalureAction
  | setApiSecretAction
  | setWalletOpenction
  | closeWalletAction
  | slateSetRequestAction
  | slateSetSuccessAction
  | slateSetFalureAction
  | slateRemoveRequestAction
  | slateRemoveSuccessAction
  | slateRemoveFalureAction
  | txReceiveRequestAction
  | txReceiveSuccessAction
  | txReceiveFalureAction
  | txFinalizeRequestAction
  | txFinalizeSuccessAction
  | txFinalizeFalureAction
  | toastShowAction
  | toastClearAction
  | txFormSetFromLinkAction
  | txFormSetAmountAction
  | txFormSetAddressAction
  | txFormSetMessageAction
  | txFormResetAction
  | txFormSetOutputStrategyAction
  | txFormOutputStrategiesRequestAction
  | txFormOutputStrategiesSuccessAction
  | txFormOutputStrategiesFalureAction
  | walletClear
  | walletInitRequestAction
  | walletInitSuccessAction
  | walletInitFalureAction
  | walletInitSetIsNewAction
  | walletScanResetAction
  | walletScanFailureAction
  | walletScanDoneAction
  | walletScanStartAction
  | walletScanPmmrRangeRequestAction
  | walletScanPmmrRangeSuccessAction
  | walletScanPmmrRangeFalureAction
  | walletScanOutputsRequestAction
  | walletScanOutputsSuccessAction
  | walletScanOutputsFalureAction
  | walletPhraseRequestAction
  | walletPhraseSuccessAction
  | walletPhraseFalureAction
  | walletDestroyRequestAction
  | walletDestroySuccessAction
  | walletDestroyFalureAction
  | walletMigrateToMainnetRequestAction
  | walletMigrateToMainnetSuccessAction
  | walletMigrateToMainnetFalureAction
  | currencyRatesRequestAction
  | currencyRatesSuccessAction
  | currencyRatesToggleAction
  | currencyRatesFalureAction
  | walletExistsRequestAction
  | walletExistsSuccessAction
  | walletExistsFalureAction

export type ToolkitActions = TorActions | TxReceiveActions

export type Currency = {
  code: string
  fractionDigits: number
}
export type Dispatch = (action: Action) => void
export type Store = {
  dispatch: Dispatch
  getState: () => RootState
}
export type OutputStrategy = {
  selectionStrategyIsUseAll: boolean
  total: string
  fee: string
}
export type PmmrRange = {
  lastRetrievedIndex: number
  highestIndex: number
}
export type Balance = {
  amountAwaitingConfirmation: string
  amountCurrentlySpendable: string
  amountImmature: string
  amountLocked: string
  lastConfirmedHeight: string
  minimumConfirmations: string
  total: string
}
type SlateParticipantData = {
  message: string
}
export type Slate = {
  id: string
  amount: number
  fee: number
  participant_data: Array<SlateParticipantData>
  sta: 'S1' | 'S2' | 'S3'
}
export type Tx = {
  id: number
  type: string
  amount: string
  confirmed: boolean
  fee: string
  creationTime: string
  slateId: string | null
  storedTx: string | null
  kernelExcess: string | null
}

// Rust structures

export type RustBalance = {
  amount_awaiting_confirmation: string
  amount_currently_spendable: string
  amount_immature: string
  amount_locked: string
  last_confirmed_height: string
  minimum_confirmations: string
  total: string
}
export type RustTx = {
  amount_credited: string
  amount_debited: string
  confirmation_ts: string | null
  confirmed: boolean
  creation_ts: string
  fee: string | null
  id: number
  kernel_excess: string | null
  kernel_lookup_min_height: string | null
  num_inputs: number
  num_outputs: number
  parent_key_id: string
  payment_proof: string | null
  reverted_after: string | null
  stored_tx: string | null
  ttl_cutoff_height: string | null
  tx_slate_id: string | null
  tx_type: string // TxReceived ...
}
export type RustOutputStrategy = {
  selection_strategy_is_use_all: boolean
  total: string
  fee: string
}
export type RustPmmrRange = Array<number> // Redux

export type Error = {
  code?: number
  message: string
}
export type UrlQuery = {
  amount: string
  destination: string
  message: string
}

export interface NavigationProps<Screen extends keyof RootStackParamList> {
  navigation: StackNavigationProp<RootStackParamList, Screen>
  route: RouteProp<RootStackParamList, Screen>
}

export type valueof<T> = T[keyof T]
