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

import { State as AppState } from 'src/modules/app'
import { State as BalanceState } from 'src/modules/balance'
import { State as TxState } from 'src/modules/tx'
import { State as SettingsState } from 'src/modules/settings'
import { State as ToastedState } from 'src/modules/toaster'
import { State as WalletState } from 'src/modules/wallet'
import { State as CurrencyRatesState } from 'src/modules/currency-rates'

import { RootStackParamList } from 'src/modules/navigation'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'

// reduxjs/toolkit

import { TorActions } from 'src/modules/tor'

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
  data: Array<RustTx>
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
export type setPasswordAction = {
  type: 'SET_PASSWORD'
  password: string
}
export type setApiSecretAction = {
  type: 'SET_API_SECRET'
  apiSecret: string
}
export type checkPasswordAction = {
  type: 'CHECK_PASSWORD'
}
export type checkPasswordFromBiometryAction = {
  type: 'CHECK_PASSWORD_FROM_BIOMETRY'
  password: string
}
export type validPasswordAction = {
  type: 'VALID_PASSWORD'
}
export type invalidPasswordAction = {
  type: 'INVALID_PASSWORD'
}
export type clearPasswordAction = {
  type: 'CLEAR_PASSWORD'
}
export type slateLoadRequestAction = {
  type: 'SLATE_LOAD_REQUEST'
  slatePath: string
}
export type slateLoadSuccessAction = {
  type: 'SLATE_LOAD_SUCCESS'
  slatepack: string
  slate: Slate
  slatePath: string
}
export type slateLoadFalureAction = {
  type: 'SLATE_LOAD_FAILURE'
  code?: number
  message: string
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
export type slateShareRequestAction = {
  type: 'SLATE_SHARE_REQUEST'
  id: string
  isResponse: boolean
}
export type slateShareSuccessAction = {
  type: 'SLATE_SHARE_SUCCESS'
}
export type slateShareFalureAction = {
  type: 'SLATE_SHARE_FAILURE'
  code?: number
  message: string
}
export type walletClear = {
  type: 'WALLET_CLEAR'
}
export type seedNewRequestAction = {
  type: 'SEED_NEW_REQUEST'
  length: number
}
export type seedNewSuccessAction = {
  type: 'SEED_NEW_SUCCESS'
  mnemonic: string
}
export type seedNewFalureAction = {
  type: 'SEED_NEW_FAILURE'
  code?: number
  message: string
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
export type walletInitSetPasswordAction = {
  type: 'WALLET_INIT_SET_PASSWORD'
  password: string
}
export type walletInitSetIsNewAction = {
  type: 'WALLET_INIT_SET_IS_NEW'
  value: boolean
}
export type walletInitSetConfirmPasswordAction = {
  type: 'WALLET_INIT_SET_CONFIRM_PASSWORD'
  confirmPassword: string
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
export type txFormSetUrlAction = {
  type: 'TX_FORM_SET_URL'
  url: string
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
  rates: { [x: string]: object }
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
  | setPasswordAction
  | setApiSecretAction
  | checkPasswordAction
  | checkPasswordFromBiometryAction
  | validPasswordAction
  | invalidPasswordAction
  | clearPasswordAction
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
  | slateLoadRequestAction
  | slateLoadSuccessAction
  | slateLoadFalureAction
  | slateShareRequestAction
  | slateShareSuccessAction
  | slateShareFalureAction
  | toastShowAction
  | toastClearAction
  | txFormSetFromLinkAction
  | txFormSetAmountAction
  | txFormSetUrlAction
  | txFormSetMessageAction
  | txFormResetAction
  | txFormSetOutputStrategyAction
  | txFormOutputStrategiesRequestAction
  | txFormOutputStrategiesSuccessAction
  | txFormOutputStrategiesFalureAction
  | walletClear
  | seedNewRequestAction
  | seedNewSuccessAction
  | seedNewFalureAction
  | walletInitRequestAction
  | walletInitSuccessAction
  | walletInitFalureAction
  | walletInitSetIsNewAction
  | walletInitSetPasswordAction
  | walletInitSetConfirmPasswordAction
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
  | TorActions

export type Currency = {
  code: string
  fractionDigits: number
}
export type State = {
  app: AppState
  balance: BalanceState
  tx: TxState
  currencyRates: CurrencyRatesState
  settings: SettingsState
  toaster: ToastedState
  wallet: WalletState
}
export type GetState = () => State
export type Dispatch = (action: Action) => any
export type Store = {
  dispatch: Dispatch
  getState: () => State
}
export type Navigation = {
  navigate: (screen: string, params?: any) => void
  replace: (screen: string, params?: any) => void
  setParams: any
  dispatch: (action: any) => void
  goBack: (key?: string | null) => void
  state: {
    params: any
  }
}
export type OutputStrategy = {
  selectionStrategyIsUseAll: boolean
  total: number
  fee: number
}
export type PmmrRange = {
  lastRetrievedIndex: number
  highestIndex: number
}
export type Balance = {
  amountAwaitingConfirmation: number
  amountCurrentlySpendable: number
  amountImmature: number
  amountLocked: number
  lastConfirmedHeight: number
  minimumConfirmations: number
  total: number
}
type SlateParticipantData = {
  message: string
}
export type Slate = {
  id: string
  amount: number
  fee: number
  participant_data: Array<SlateParticipantData>
}
export type Tx = {
  id: number
  type: string
  amount: number
  confirmed: boolean
  fee: number
  creationTime: any
  slateId: string
  storedTx: string
} // Rust structures

export type RustState = {
  wallet_dir: string
  check_node_api_http_addr: string
  chain: string
  account?: string
  password?: string
}
export type RustBalance = {
  amount_awaiting_confirmation: number
  amount_currently_spendable: number
  amount_immature: number
  amount_locked: number
  last_confirmed_height: number
  minimum_confirmations: number
  total: number
}
export type RustTx = {
  amount_credited: number
  amount_debited: number
  confirmation_ts: number
  confirmed: boolean
  creation_ts: string
  fee: number
  id: number
  num_inputs: number
  num_outputs: number
  parent_key_id: string
  tx_hex: string
  tx_slate_id: string
  tx_type: string
  stored_tx: string
}
export type RustOutputStrategy = {
  selection_strategy_is_use_all: boolean
  total: number
  fee: number
}
export type RustPmmrRange = Array<number> // Redux

export type Error = {
  code: number
  message: string
}
export type UrlQuery = object

export interface NavigationProps<Screen extends keyof RootStackParamList> {
  navigation: StackNavigationProp<RootStackParamList, Screen>
  route: RouteProp<RootStackParamList, Screen>
}
