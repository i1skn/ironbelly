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
import { type State as ReduxState, type Navigation } from 'common/types'
import ScreenWithManySteps from 'components/ScreenWithManySteps'
import Phrase from './phrase'
import { type WalletInitState } from 'modules/wallet'

type Props = {
  walletInit: WalletInitState,
  navigation: Navigation,
  recover: () => void,
  setPassword: (password: string) => void,
}
type State = {
  inputValue: string,
  amount: number,
  valid: boolean,
}

class Recovery extends Component<Props, State> {
  componentDidUpdate(prevProps) {
    if (this.props.walletInit.inProgress && !prevProps.walletInit.inProgress) {
      this.props.navigation.navigate('RecoveryInProgress')
    }
  }

  steps = [Phrase]

  componentDidMount() {}

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
          this.props.setPassword(walletInit.password)
          this.props.recover()
        }}
      />
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  walletInit: state.wallet.walletInit,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setPassword: password => {
    dispatch({ type: 'SET_PASSWORD', password })
  },
  recover: () => {
    dispatch({ type: 'WALLET_RECOVERY_REQUEST' })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Recovery)
