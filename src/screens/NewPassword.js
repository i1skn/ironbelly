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
import { ifIphoneX } from 'react-native-iphone-x-helper'

import { connect } from 'react-redux'
import FormTextInput from 'components/FormTextInput'
import styled from 'styled-components/native'
import { type State as ReduxState, type Error, type Navigation } from 'common/types'
import { colors, Spacer, FlexGrow, Wrapper } from 'common'
import { Button, Text } from 'components/CustomFont'

type Props = {
  error: Error,
  navigation: Navigation,
  setPassword: (password: string) => void,
  password: string,
  setConfirmPassword: (confirmPassword: string) => void,
  confirmPassword: string,
}

type State = {}

const Desc = styled.View`
  background-color: ${colors.accent};
  padding: 0 16px 16px 16px;
`

class NewPassword extends Component<Props, State> {
  static navigationOptions = {
    title: 'Set Password',
  }

  render() {
    const { password, setPassword, confirmPassword, setConfirmPassword, navigation } = this.props
    return (
      <FlexGrow>
        <Wrapper
          behavior="padding"
          style={{ flex: 1 }}
          keyboardVerticalOffset={ifIphoneX() ? 88 : 64}
        >
          <Spacer />
          <FormTextInput
            testID="EnterPassword"
            autoFocus={true}
            secureTextEntry={true}
            onChange={setPassword}
            value={password}
            placeholder="Password"
          />
          <Spacer />
          <FormTextInput
            testID="ConfirmPassword"
            autoFocus={false}
            secureTextEntry={true}
            onChange={setConfirmPassword}
            value={confirmPassword}
            placeholder="Confirm password"
          />
          <FlexGrow />
          <Button
            testID="EnterPassword"
            title={'Continue'}
            onPress={() => navigation.navigate('ShowPaperKey')}
            disabled={!(password && password === confirmPassword)}
          />
          <Spacer />
        </Wrapper>
      </FlexGrow>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  settings: state.settings,
  error: state.tx.txCreate.error,
  password: state.wallet.walletInit.password,
  confirmPassword: state.wallet.walletInit.confirmPassword,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setPassword: password => {
    dispatch({ type: 'WALLET_INIT_SET_PASSWORD', password })
  },
  setConfirmPassword: confirmPassword => {
    dispatch({ type: 'WALLET_INIT_SET_CONFIRM_PASSWORD', confirmPassword })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewPassword)
