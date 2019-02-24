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
import { View, ActivityIndicator, AlertIOS, Button as NativeButton } from 'react-native'
import FormTextInput from 'components/FormTextInput'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import RNFS from 'react-native-fs'

import { WALLET_DATA_DIRECTORY, Spacer, Wrapper, FlexGrow, colors, LoaderView } from 'common'
import { Button } from 'components/CustomFont'
import { type State as ReduxState, type Navigation } from 'common/types'

type Props = {
  navigation: Navigation,
  setPassword: (password: string) => void,
  checkPassword: () => void,
  isPasswordValid: boolean,
  error: { message: string },
  getBalance: () => void,
  password: string,
  inProgress: boolean,
  clearWallet: () => void,
}
type State = {}

const Submit = styled(Button)``

const Forget = styled(View)`
  margin-top: -54px;
  align-items: flex-end;
`

class Password extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isPasswordValid !== this.props.isPasswordValid && this.props.isPasswordValid) {
      const { nextScreen } = this.props.navigation.state.params
      this.props.navigation.navigate(nextScreen.name, nextScreen.params)
    }
  }

  render() {
    const { password, navigation, setPassword, checkPassword, inProgress, clearWallet } = this.props

    return (
      <Wrapper behavior="padding" enabled>
        {(inProgress && (
          <LoaderView>
            <ActivityIndicator size="large" color={colors.primary} />
          </LoaderView>
        )) || (
          <React.Fragment>
            <FlexGrow />
            <FormTextInput
              autoFocus={true}
              secureTextEntry={true}
              onChange={password => {
                setPassword(password)
              }}
              value={password}
              placeholder="Enter password"
            />
            <Forget>
              <NativeButton
                title="Forgot?"
                disabled={false}
                danger
                onPress={() => {
                  AlertIOS.alert(
                    'Forgot password',
                    'There is no way to restore the password. You can destroy the wallet and restore it if you have recovery passphrase backed up. Then you can provide a new password.',
                    [
                      {
                        text: 'Back',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      {
                        text: 'Destroy the wallet',
                        style: 'destructive',
                        onPress: () => {
                          AlertIOS.alert(
                            'Destroy the wallet',
                            'This action would remove all of your data!',
                            [
                              {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel',
                              },
                              {
                                text: 'Destroy',
                                style: 'destructive',
                                onPress: () => {
                                  RNFS.unlink(WALLET_DATA_DIRECTORY).then(() => {
                                    clearWallet()
                                    navigation.navigate('Initial')
                                  })
                                },
                              },
                            ]
                          )
                        },
                      },
                    ]
                  )
                }}
              />
            </Forget>
            <FlexGrow />
            <Submit
              title="Unlock"
              disabled={false}
              onPress={() => {
                checkPassword()
              }}
            />
            <Spacer />
          </React.Fragment>
        )}
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  isPasswordValid: state.wallet.password.valid,
  error: state.wallet.password.error,
  password: state.wallet.password.value,
  inProgress: state.wallet.password.inProgress,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  getBalance: () => {
    dispatch({ type: 'BALANCE_REQUEST' })
  },
  setPassword: password => {
    dispatch({ type: 'SET_PASSWORD', password })
  },
  checkPassword: () => {
    dispatch({ type: 'CHECK_PASSWORD' })
  },
  clearWallet: () => {
    dispatch({ type: 'TX_LIST_CLEAR' })
    dispatch({ type: 'WALLET_CLEAR' })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Password)
