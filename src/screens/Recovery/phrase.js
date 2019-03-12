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
import { connect } from 'react-redux'

import FormTextInput from 'components/FormTextInput'
import { type State as ReduxState } from 'common/types'
import { type WalletInitState } from 'modules/wallet'

import ChevronLeftImg from 'assets/images/ChevronLeft.png'
import { store } from 'common/redux'
import { type MoveFunc } from 'components/ScreenWithManySteps'

type Props = {
  setPhrase: (mnemonic: string) => void,
  walletInit: WalletInitState,
}

type State = {}

class Phrase extends Component<Props, State> {
  static backButtonText = 'Back'
  static backButtonIcon = ChevronLeftImg
  static nextButtonText = 'Next'
  static nextButtonDisabled = () => {
    const state = store.getState()
    return [12, 24].indexOf(state.wallet.walletInit.mnemonic.trim().split(' ').length) === -1
  }
  static nextButtonClick = (move: MoveFunc) => {
    return () => {
      move(1)
    }
  }
  render() {
    const { setPhrase, walletInit } = this.props
    return (
      <React.Fragment>
        <FormTextInput
          title={'Recovery phrase'}
          autoFocus={true}
          onChange={setPhrase}
          value={walletInit.mnemonic}
          placeholder="12 or 24 words"
        />
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  walletInit: state.wallet.walletInit,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setPhrase: mnemonic => {
    dispatch({ type: 'WALLET_RECOVERY_SET_MNEMONIC', mnemonic })
  },
})

export const validate = (password: any) => {
  return
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Phrase)
