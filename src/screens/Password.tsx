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

import React, { Component } from 'react'
import * as LocalAuthentication from 'expo-local-authentication'
import {
  View,
  TouchableWithoutFeedback,
  Alert,
  Keyboard,
  StyleSheet,
} from 'react-native'
import { Text } from 'src/components/CustomFont'
import FormTextInput from 'src/components/FormTextInput'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import { BIOMETRY_STATUS } from 'src/modules/settings'
import { isAndroid, getBiometryTitle } from 'src/common'
import { KeyboardAvoidingWrapper } from 'src/common'
import { Button } from 'src/components/CustomFont'
import { State as ReduxState, Navigation } from 'src/common/types'
import * as Keychain from 'react-native-keychain'
import { Dispatch } from 'src/common/types'
import colors from 'src/common/colors'
type Props = {
  navigation: Navigation
  setPassword: (password: string) => void
  checkPassword: (password: string) => void
  isPasswordValid: boolean
  error: {
    message: string
  }
  password: string
  inProgress: boolean
  destroyWallet: () => void
  clearToast: () => void
  biometryEnabled: boolean
  biometryType: string | undefined | null
  checkPasswordFromBiometry: (password: string) => void
  scanInProgress: boolean
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

  componentDidMount() {
    const { biometryEnabled, biometryType } = this.props

    if (biometryEnabled && biometryType !== Keychain.BIOMETRY_TYPE.FACE_ID) {
      setTimeout(() => this._getPasswordFromBiometry(), 250)
    }
  }

  async _getPasswordFromBiometry() {
    const { checkPasswordFromBiometry, biometryType } = this.props
    const authenticationPrompt = {
      title:
        biometryType === Keychain.BIOMETRY_TYPE.FACE_ID
          ? 'Use Face ID to unlock your wallet'
          : 'Place your finger to unlock your wallet',
    }

    try {
      // Force on Android authentication until we figure how
      // to force it automatically on Keychain.getGenericPassword
      if (isAndroid) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: authenticationPrompt.title,
          disableDeviceFallback: true,
          cancelLabel: 'Enter Password',
        })
        if (!result.success) {
          return
        }
      }
      const creds = await Keychain.getGenericPassword({
        authenticationPrompt,
      })
      if (creds && creds.password) {
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
      ],
    )
  }
  _onDestroy = () => {
    Alert.alert(
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
            this.props.destroyWallet()
          },
        },
      ],
    )
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
        behavior={isAndroid ? undefined : 'padding'}
        style={styles.container}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss()
          }}>
          <View style={styles.wrapper}>
            <View style={styles.spanTop} />
            <FormTextInput
              autoFocus={false}
              secureTextEntry={true}
              onChange={(password) => {
                setPassword(password)
              }}
              value={password}
              placeholder="Enter password"
            />
            <ForgotButton disabled={false} onPress={this._onForgot}>
              <Text style={styles.forgot}>Forgot?</Text>
            </ForgotButton>
            <Submit
              title={`Unlock${
                biometryEnabled && !password
                  ? ' with ' + getBiometryTitle(biometryType)
                  : ''
              }`}
              disabled={inProgress}
              onPress={() => {
                if (biometryEnabled && !password) {
                  this._getPasswordFromBiometry()
                } else {
                  checkPassword(password)
                }
              }}
            />
            <View style={styles.spanBottom} />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingWrapper>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wrapper: {
    flex: 1,
  },
  spanTop: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '40%',
  },
  spanBottom: {
    flexGrow: 10,
    flexShrink: 0,
    flexBasis: 16,
  },
  forgot: {
    lineHeight: 27,
    color: colors.onSurface,
  },
})

const mapStateToProps = (state: ReduxState) => ({
  isPasswordValid: state.wallet.password.valid,
  error: state.wallet.password.error,
  password: state.wallet.password.value,
  inProgress: state.wallet.password.inProgress,
  biometryEnabled: state.settings.biometryStatus === BIOMETRY_STATUS.enabled,
  biometryType: state.settings.biometryType,
  scanInProgress: state.wallet.walletScan.inProgress,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setPassword: (password: string) => {
    dispatch({
      type: 'SET_PASSWORD',
      password,
    })
  },
  checkPasswordFromBiometry: (password: string) => {
    dispatch({
      type: 'CHECK_PASSWORD_FROM_BIOMETRY',
      password,
    })
  },
  checkPassword: (password: string) => {
    dispatch({
      type: 'CHECK_PASSWORD',
      password,
    })
  },
  destroyWallet: () => {
    dispatch({
      type: 'WALLET_DESTROY_REQUEST',
    })
  },
  clearToast: () =>
    dispatch({
      type: 'TOAST_CLEAR',
    }),
})

export default connect(mapStateToProps, mapDispatchToProps)(Password)
