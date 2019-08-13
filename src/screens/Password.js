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
import {
  View,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  Button as NativeButton,
  Keyboard,
} from 'react-native'
import { Text } from 'components/CustomFont'
import FormTextInput from 'components/FormTextInput'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import { BIOMETRY_STATUS } from 'modules/settings'
import { isAndroid, getBiometryTitle } from 'common'

import { Spacer, KeyboardAvoidingWrapper, FlexGrow, LoaderView } from 'common'
import colors from 'common/colors'
import { Button } from 'components/CustomFont'
import { type State as ReduxState, type Navigation } from 'common/types'
import * as Keychain from 'react-native-keychain'
import TouchID from 'react-native-touch-id'

type Props = {
  navigation: Navigation,
  setPassword: (password: string) => void,
  checkPassword: () => void,
  isPasswordValid: boolean,
  error: { message: string },
  password: string,
  inProgress: boolean,
  destroyWallet: () => void,
  clearToast: () => void,
  biometryEnabled: boolean,
  biometryType: ?string,
  checkPasswordFromBiometry: (password: string) => void,
}

type State = {}

const Submit = styled(Button)``

const ForgotButton = styled.TouchableOpacity`
  margin-top: -46px;
  margin-bottom: 40px;
  align-self: flex-end;
`

class Password extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  componentDidMount(prevProps) {
    const { biometryEnabled, biometryType } = this.props
    if (biometryEnabled && biometryType !== Keychain.BIOMETRY_TYPE.FACE_ID) {
      setTimeout(() => this._getPasswordFromBiometry(), 250)
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isPasswordValid !== this.props.isPasswordValid && this.props.isPasswordValid) {
      const { nextScreen } = this.props.navigation.state.params
      this.props.clearToast()
      this.props.navigation.navigate(nextScreen.name, nextScreen.params)
    }
  }

  async _getPasswordFromBiometry() {
    const { checkPasswordFromBiometry, biometryType } = this.props
    const authenticationPrompt =
      biometryType === Keychain.BIOMETRY_TYPE.FACE_ID
        ? 'Use Face ID to unlock your wallet'
        : 'Place your finger to unlock your wallet'
    try {
      if (isAndroid) {
        await TouchID.authenticate(authenticationPrompt, {
          title: 'Authentication Required',
          passcodeFallback: false,
          cancelText: 'Cancel',
          fallbackLabel: '',
        })
      }
      const creds = await Keychain.getGenericPassword({ authenticationPrompt })
      if (typeof creds.password === 'string') {
        checkPasswordFromBiometry(creds.password)
      }
    } catch (e) {
      console.log(e)
    }
  }

  _onForgot = () => {
    Alert.alert(
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
          onPress: this._onDestroy,
        },
      ]
    )
  }

  _onDestroy = () => {
    Alert.alert('Destroy the wallet', 'This action would remove all of your data!', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Destroy',
        style: 'destructive',
        onPress: () => {
          this.props.destroyWallet()
        },
      },
    ])
  }

  render() {
    const {
      biometryEnabled,
      biometryType,
      password,
      setPassword,
      checkPassword,
      inProgress,
    } = this.props

    return (
      <KeyboardAvoidingWrapper
        behavior={isAndroid ? '' : 'padding'}
        style={{
          flex: 1,
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss()
          }}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: '40%' }} />
            <FormTextInput
              autoFocus={false}
              secureTextEntry={true}
              onChange={password => {
                setPassword(password)
              }}
              value={password}
              placeholder="Enter password"
            />
            <ForgotButton disabled={false} onPress={this._onForgot}>
              <Text>Forgot?</Text>
            </ForgotButton>
            <Submit
              title={`Unlock${
                biometryEnabled && !password ? ' with ' + getBiometryTitle(biometryType) : ''
              }`}
              disabled={inProgress}
              onPress={() => {
                if (biometryEnabled && !password) {
                  this._getPasswordFromBiometry()
                } else {
                  checkPassword()
                }
              }}
            />
            <View style={{ flexGrow: 10, flexShrink: 0, flexBasis: 16 }} />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingWrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  isPasswordValid: state.wallet.password.valid,
  error: state.wallet.password.error,
  password: state.wallet.password.value,
  inProgress: state.wallet.password.inProgress,
  biometryEnabled: state.settings.biometryStatus === BIOMETRY_STATUS.enabled,
  biometryType: state.settings.biometryType,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setPassword: password => {
    dispatch({ type: 'SET_PASSWORD', password })
  },
  checkPasswordFromBiometry: (password: string) => {
    dispatch({ type: 'CHECK_PASSWORD_FROM_BIOMETRY', password })
  },
  checkPassword: () => {
    dispatch({ type: 'CHECK_PASSWORD' })
  },
  destroyWallet: () => {
    dispatch({ type: 'WALLET_DESTROY_REQUEST' })
  },
  clearToast: () => dispatch({ type: 'TOAST_CLEAR' }),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Password)
