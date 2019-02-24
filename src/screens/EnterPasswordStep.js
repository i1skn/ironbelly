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
import { type State as ReduxState, type Error, type Navigation } from 'common/types'

import ChevronLeftImg from 'assets/images/ChevronLeft.png'
import { store } from 'common/redux'
import { type MoveFunc } from 'components/ScreenWithManySteps'

type Props = {
  error: Error,
  navigation: Navigation,
  setPassword: (password: string) => void,
  password: string,
}

type State = {}

class Password extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  static backButtonText = 'Back'
  static backButtonIcon = ChevronLeftImg
  static nextButtonText = 'Next'
  static nextButtonDisabled = () => {
    const state = store.getState()
    return !state.wallet.walletInit.password
  }
  static nextButtonClick = (move: MoveFunc) => {
    return () => {
      move('right')
    }
  }

  render() {
    const { password, setPassword } = this.props
    return (
      <React.Fragment>
        <FormTextInput
          title={'Enter password'}
          autoFocus={true}
          secureTextEntry={true}
          onChange={setPassword}
          value={password}
          placeholder="Password"
        />
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  settings: state.settings,
  error: state.tx.txCreate.error,
  password: state.wallet.walletInit.password,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setPassword: password => {
    dispatch({ type: 'WALLET_INIT_SET_PASSWORD', password })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Password)
