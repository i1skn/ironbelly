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
import ReactNative, { Alert, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { connect } from 'react-redux'
import MnemonicWordTextInput from 'src/components/MnemonicWordTextInput'
import NetInfo from '@react-native-community/netinfo'
import { UnderHeaderBlock, Spacer } from 'src/common'
import { Text, Button } from 'src/components/CustomFont'
import { RootState } from 'src/common/redux'
import { NavigationProps, Dispatch } from 'src/common/types'
import { WalletScanState } from 'src/modules/wallet'
import { styleSheetFactory, useThemedStyles } from 'src/themes'

type Props = NavigationProps<'VerifyPaperKey'> &
  WalletScanState & {
    isNew: boolean
    createWallet: (password: string, mnemonic: string, isNew: boolean) => void
  }

type State = {
  inputValue: string
  amount: number
  valid: boolean
  mnemonicWords: Array<string>
  wordsCount: number
}

class Verify extends Component<Props, State> {
  _scrollView: KeyboardAwareScrollView | null = null
  _underHeaderBlock = null
  _inputs: ReactNative.TextInput[] = []

  constructor(props: Props) {
    super(props)
    const wordsCount = props.route.params.wordsCount
    this.state = {
      wordsCount,
      inputValue: '',
      amount: 0,
      valid: false,
      mnemonicWords: Array(wordsCount).fill(''),
    }
  }

  _onContinuePress = (currentUserPhrase: string) => {
    return () => {
      const { isNew, route, createWallet } = this.props

      if (!isNew) {
        NetInfo.fetch().then(({ type }) => {
          if (type === 'none') {
            Alert.alert(
              'Device is offline',
              'Wallet recovery requires connection to the internet!',
              [
                {
                  text: 'Ok',
                },
              ],
            )
          } else if (type !== 'wifi') {
            Alert.alert(
              'Warning',
              'Wallet recovery requires to download A LOT OF DATA. Consider, that depend on your internet provider additional costs may occur!',
              [
                {
                  text: 'Cancel',
                },
                {
                  text: 'Continue',
                  style: 'destructive',
                  onPress: () => {
                    createWallet(
                      route.params.password,
                      currentUserPhrase,
                      isNew,
                    )
                  },
                },
              ],
            )
          } else {
            createWallet(route.params.password, currentUserPhrase, isNew)
          }
        })
      } else {
        createWallet(route.params.password, currentUserPhrase, isNew)
      }
    }
  }

  fillFromPreviousStep = () => {
    const { route } = this.props
    this.setState({
      mnemonicWords: (route.params?.mnemonic ?? '').split(' '),
    })
  }

  fillFromAlert = () => {
    Alert.prompt('Seed', 'Words separated with spaces', (text: string) => {
      this.setState({
        mnemonicWords: text.split(' '),
      })
    })
  }

  render() {
    const { route, isNew } = this.props
    const { mnemonicWords, wordsCount } = this.state
    const currentUserPhrase = mnemonicWords
      .map((w) => w.toLowerCase())
      .join(' ')
    const verified = isNew
      ? route.params.mnemonic === currentUserPhrase
      : mnemonicWords.reduce((acc, w) => acc + (w.length ? 1 : 0), 0) ===
        wordsCount
    const [styles] = useThemedStyles(themedStyles)
    return (
      <View style={styles.wrapper}>
        {__DEV__ && (
          <Button
            style={{ marginHorizontal: 16, marginBottom: 16 }}
            title={'[DEV] Enter words'}
            onPress={isNew ? this.fillFromPreviousStep : this.fillFromAlert}
          />
        )}
        {(wordsCount && (
          <>
            <KeyboardAwareScrollView
              innerRef={(sv) =>
                (this._scrollView = (sv as unknown) as KeyboardAwareScrollView)
              }
              style={styles.scrollView}
              keyboardShouldPersistTaps={'handled'}
              extraScrollHeight={8}
              enableResetScrollToCoords={false}
              keyboardOpeningTime={0}>
              <UnderHeaderBlock>
                <Text>
                  {isNew
                    ? 'Enter the paper key you have just written to verify its correctness.'
                    : 'Enter the paper key to continue.'}
                </Text>
              </UnderHeaderBlock>
              <View style={styles.words}>
                {mnemonicWords.map((_, i: number) => {
                  return (
                    <MnemonicWordTextInput
                      key={i}
                      getRef={(input) => {
                        if (input) {
                          this._inputs[i] = input
                        }
                      }}
                      testID={`VerifyWord${i + 1}`}
                      number={i}
                      autoFocus={!i}
                      returnKeyType={i < wordsCount - 1 ? 'next' : 'done'}
                      onSubmitEditing={() => {
                        if (i < wordsCount - 1) {
                          this._inputs[i + 1].focus()
                        } else {
                          setTimeout(() => {
                            if (this._scrollView) {
                              this._scrollView.scrollToEnd()
                            }
                          }, 100)
                        }
                      }}
                      onChange={(value) => {
                        this.setState({
                          mnemonicWords: mnemonicWords.map((w, j) => {
                            if (j === i) {
                              return value
                            }

                            return w
                          }),
                        })
                      }}
                      value={mnemonicWords[i]}
                    />
                  )
                })}
              </View>
              <Button
                testID="VerifyPaperKeyContinueButton"
                title="Continue"
                disabled={!verified}
                onPress={this._onContinuePress(currentUserPhrase)}
              />
              <Spacer />
            </KeyboardAwareScrollView>
          </>
        )) ||
          null}
      </View>
    )
  }
}

const themedStyles = styleSheetFactory(() => ({
  wrapper: {
    marginVertical: 16,
  },
  words: {
    flex: 1,
    paddingVertical: 32,
  },
  scrollView: {
    paddingLeft: 16,
    paddingRight: 16,
  },
}))

const mapStateToProps = (state: RootState) => ({
  ...state.wallet.walletScan,
  isNew: state.wallet.walletInit.isNew,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createWallet: (password: string, phrase: string, isNew: boolean) => {
    dispatch({
      type: 'WALLET_INIT_REQUEST',
      password,
      phrase,
      isNew,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Verify)
