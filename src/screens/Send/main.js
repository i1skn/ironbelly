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

import React, { Component } from 'react'
import { Keyboard } from 'react-native'
import { connect } from 'react-redux'
import Amount from './amount'
import Strategy from './strategy'
import Message from './message'
import Transport from './transport'
import Address from './address'

import ScreenWithManySteps from 'components/ScreenWithManySteps'

import { type TxForm } from 'modules/tx'
import { type State as SettingsState } from 'modules/settings'
import {
  type State as ReduxState,
  type Error,
  type Navigation,
  type RustOutputStrategy,
} from 'common/types'

type Props = {
  txCreate: (amount: number, message: string, selectionStrategyIsUseAll: boolean) => void,
  txSendHttps: (
    amount: number,
    message: string,
    url: string,
    selectionStrategyIsUseAll: boolean
  ) => void,
  setOutputStrategies: (outputStrategies: Array<RustOutputStrategy>) => void,
  txForm: TxForm,
  settings: SettingsState,
  error: Error,
  isCreated: boolean,
  isSent: boolean,
  navigation: Navigation,
  password: string,
}

type State = {}

class Send extends Component<Props, State> {
  steps = [Amount, Strategy, Message, Transport, Address]

  componentDidUpdate(prevProps) {
    if (
      (!prevProps.isCreated && this.props.isCreated) ||
      (!prevProps.isSent && this.props.isSent)
    ) {
      this.props.navigation.goBack()
    }
  }

  render() {
    const { navigation, txForm } = this.props
    const { amount, message, outputStrategy, url } = txForm
    return (
      <ScreenWithManySteps
        steps={this.steps}
        navigation={navigation}
        cancelAction={() => {
          Keyboard.dismiss()
          navigation.goBack(null)
        }}
        finalAction={() => {
          if (outputStrategy) {
            if (url) {
              this.props.txSendHttps(amount, message, url, outputStrategy.selectionStrategyIsUseAll)
            } else {
              this.props.txCreate(amount, message, outputStrategy.selectionStrategyIsUseAll)
            }
          }
        }}
      />
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  settings: state.settings,
  txForm: state.tx.txForm,
  isCreated: state.tx.txCreate.created,
  isSent: state.tx.txSend.sent,
  error: state.tx.txCreate.error,
  password: state.wallet.password.value,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  txCreate: (amount: number, message: string, selectionStrategyIsUseAll: boolean) => {
    dispatch({ type: 'TX_CREATE_REQUEST', amount, message, selectionStrategyIsUseAll })
  },
  txSendHttps: (
    amount: number,
    message: string,
    url: string,
    selectionStrategyIsUseAll: boolean
  ) => {
    dispatch({ type: 'TX_SEND_HTTPS_REQUEST', amount, message, url, selectionStrategyIsUseAll })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Send)
