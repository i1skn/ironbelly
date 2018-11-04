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
import ManyStepsView from 'components/ManyStepsView'
import Phrase, { validate as PhraseValidate } from './phrase'
import Password, { validate as PasswordValidate } from './password'
import { type WalletRecoveryState } from 'modules/wallet'

type Props = {
  walletRecovery: WalletRecoveryState,
  navigation: Navigation,
  recover: () => void,
}
type State = {
  inputValue: string,
  amount: number,
  valid: boolean,
}

class Recovery extends Component<Props, State> {
  componentDidUpdate(prevProps) {
    if (this.props.walletRecovery.inProgress && !prevProps.walletRecovery.inProgress) {
      this.props.navigation.navigate('Overview')
    }
  }

  steps = [
    {
      container: Phrase,
      validate: () => {
        return PhraseValidate(this.props.walletRecovery.phrase)
      },
    },
    {
      container: Password,
      validate: () => {
        return PasswordValidate(this.props.walletRecovery.password)
      },
    },
  ]

  componentDidMount() {}

  render() {
    const { navigation } = this.props

    return (
      <ManyStepsView
        steps={this.steps}
        navigation={navigation}
        cancelAction={() => {
          Keyboard.dismiss()
          navigation.goBack()
        }}
        finalAction={() => {
          this.props.recover()
        }}
      />
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  walletRecovery: state.wallet.walletRecovery,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  recover: () => {
    dispatch({ type: 'WALLET_RECOVERY_REQUEST' })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Recovery)
