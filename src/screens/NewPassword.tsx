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
import { Alert } from 'react-native'
import { connect } from 'react-redux'
import FormTextInput from 'src/components/FormTextInput'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
  State as ReduxState,
  Error,
  NavigationProps,
  Dispatch,
} from 'src/common/types'
import { Wrapper, UnderHeaderBlock, Spacer, FlexGrow } from 'src/common'
import { Button, Text } from 'src/components/CustomFont'

type Props = NavigationProps<'NewPassword'> & {
  error: Error | undefined | null
  setPassword: (password: string) => void
  password: string
  setConfirmPassword: (confirmPassword: string) => void
  confirmPassword: string
  newWallet: boolean
  setIsNew: (value: boolean) => void
}

class NewPassword extends Component<Props> {
  UNSAFE_componentWillMount() {
    const { route, setIsNew } = this.props

    if (route?.params) {
      setIsNew(route.params?.isNew ?? false)
    }
  }

  _confirmPassword = null
  _scrollView: KeyboardAwareScrollView | null = null

  render() {
    const {
      newWallet,
      password,
      setPassword,
      confirmPassword,
      setConfirmPassword,
      navigation,
    } = this.props
    return (
      <FlexGrow>
        <KeyboardAwareScrollView
          style={{
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardOpeningTime={0}
          innerRef={(sv) => {
            this._scrollView = (sv as unknown) as KeyboardAwareScrollView
          }}>
          <Wrapper>
            <UnderHeaderBlock>
              <Text>Choose a strong password to protect your new wallet.</Text>
            </UnderHeaderBlock>
            <Spacer />
            <FormTextInput
              testID="Password"
              returnKeyType={'next'}
              autoFocus={true}
              secureTextEntry={true}
              onChange={setPassword}
              value={password}
              title="Password"
            />
            <Spacer />
            <FormTextInput
              testID="ConfirmPassword"
              returnKeyType={'done'}
              autoFocus={false}
              secureTextEntry={true}
              onChange={setConfirmPassword}
              onFocus={() => {
                if (this._scrollView) {
                  setTimeout(() => {
                    if (this._scrollView) {
                      this._scrollView.scrollToEnd()
                    }
                  }, 100)
                }
              }}
              value={confirmPassword}
              title="Confirm password"
            />
            <FlexGrow />
            <Spacer />
            <Button
              testID="SubmitPassword"
              title={'Continue'}
              onPress={() => {
                if (newWallet) {
                  navigation.navigate('ShowPaperKey')
                } else {
                  Alert.alert(
                    'Paper key',
                    'How many words in your paper key?',
                    [
                      {
                        text: '12',
                        onPress: () => {
                          navigation.navigate('VerifyPaperKey', {
                            title: 'Paper key',
                            wordsCount: 12,
                          })
                        },
                      },
                      {
                        text: '24',
                        onPress: () => {
                          navigation.navigate('VerifyPaperKey', {
                            title: 'Paper key',
                            wordsCount: 24,
                          })
                        },
                      },
                    ],
                  )
                }
              }}
              disabled={!(password && password === confirmPassword)}
            />
            <Spacer />
          </Wrapper>
        </KeyboardAwareScrollView>
      </FlexGrow>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  settings: state.settings,
  error: state.tx.txCreate.error,
  password: state.wallet.walletInit.password,
  newWallet: state.wallet.walletInit.isNew,
  confirmPassword: state.wallet.walletInit.confirmPassword,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setPassword: (password: string) => {
    dispatch({
      type: 'WALLET_INIT_SET_PASSWORD',
      password,
    })
  },
  setConfirmPassword: (confirmPassword: string) => {
    dispatch({
      type: 'WALLET_INIT_SET_CONFIRM_PASSWORD',
      confirmPassword,
    })
  },
  setIsNew: (value: boolean) => {
    dispatch({
      type: 'WALLET_INIT_SET_IS_NEW',
      value,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(NewPassword)
