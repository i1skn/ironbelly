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
import Password from 'screens/EnterPasswordStep'
import Confirm from 'screens/ConfirmPasswordStep'
import { type WalletInitState } from 'modules/wallet'

import ScreenWithManySteps from 'components/ScreenWithManySteps'

import { type TxForm } from 'modules/tx'
import { type State as SettingsState } from 'modules/settings'
import {
  type State as ReduxState,
  type Error,
  type Navigation,
  type RustOutputStrategy,
  type Step,
} from 'common/types'

type Props = {
  walletInit: WalletInitState,
  initNewWallet: (password: string) => void,
  setOutputStrategies: (outputStrategies: Array<RustOutputStrategy>) => void,
  txForm: TxForm,
  settings: SettingsState,
  error: Error,
  isCreated: boolean,
  navigation: Navigation,
}

type State = {}

class CreatePassword extends Component<Props, State> {
  steps: Array<Step>
  constructor(props) {
    super(props)
    this.steps = [Password, Confirm]
  }

  render() {
    const { navigation, walletInit } = this.props
    return (
      <ScreenWithManySteps
        steps={this.steps}
        navigation={navigation}
        cancelAction={() => {
          Keyboard.dismiss()
          navigation.goBack(null)
        }}
        finalAction={() => {
          this.props.initNewWallet(walletInit.password)
          navigation.navigate('Mnemonic')
        }}
      />
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  settings: state.settings,
  walletInit: state.wallet.walletInit,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  initNewWallet: password => {
    dispatch({ type: 'WALLET_INIT_REQUEST', password })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreatePassword)
