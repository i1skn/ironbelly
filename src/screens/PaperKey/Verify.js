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

import React, { Component, Fragment } from 'react'
import { Alert } from 'react-native'
// $FlowFixMe
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import MnemonicWordTextInput from 'components/MnemonicWordTextInput'

import NetInfo from '@react-native-community/netinfo'
import { UnderHeaderBlock, FlexGrow, Spacer } from 'common'
import { Text, Button } from 'components/CustomFont'
import { type State as ReduxState, type Navigation } from 'common/types'
import { type WalletInitState } from 'modules/wallet'

type Props = WalletInitState & {
  navigation: Navigation,
  createWallet: (password: string, mnemonic: string, isNew: boolean) => void,
}
type State = {
  inputValue: string,
  amount: number,
  valid: boolean,
  mnemonicWords: Array<string>,
  wordsCount: number,
}

const Words = styled.View`
  margin: 16px 0;
`

const Wrapper = styled.View`
  flex: 1;
`

class Verify extends Component<Props, State> {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.title}`,
  })

  _inputs = []
  _scrollView = null
  _underHeaderBlock = null

  constructor(props) {
    super(props)
    const wordsCount =
      props.navigation.state.params && props.navigation.state.params.wordsCount
        ? props.navigation.state.params.wordsCount
        : 24
    this.state = {
      wordsCount,
      inputValue: '',
      amount: 0,
      valid: false,
      mnemonicWords: Array(wordsCount).fill(''),
    }
  }
  componentDidMount() {
    // Only for testing
    //
    // New wallet
    // this.setState({
    // mnemonicWords: this.props.mnemonic.split(' '),
    // })
    //
    // Restore
    // this.setState({
    // mnemonicWords: ''.split(' '),
    // })
  }

  componentDidUpdate(prevProps) {
    if (this.props.inProgress && !prevProps.inProgress) {
      this.props.navigation.navigate('WalletPrepare')
    }
  }

  _onContinuePress = currentUserPhrase => {
    return () => {
      const { isNew, password, createWallet } = this.props
      if (!isNew) {
        NetInfo.getConnectionInfo().then(({ type }) => {
          if (type === 'none') {
            Alert.alert(
              `Device is offline`,
              `Wallet recovery requires connection to the internet!`,
              [
                {
                  text: 'Ok',
                  onPress: () => {},
                },
              ]
            )
          } else if (type !== 'wifi') {
            Alert.alert(
              `Warning`,
              `Wallet recovery requires to download A LOT OF DATA. Consider, that depend on your internet provider additional costs may occur!`,
              [
                {
                  text: 'Cancel',
                  onPress: () => {},
                },
                {
                  text: 'Continue',
                  style: 'destructive',
                  onPress: () => {
                    createWallet(password, currentUserPhrase, isNew)
                  },
                },
              ]
            )
          } else {
            createWallet(password, currentUserPhrase, isNew)
          }
        })
      } else {
        createWallet(password, currentUserPhrase, isNew)
      }
    }
  }
  render() {
    const { mnemonic, isNew } = this.props
    const { mnemonicWords, wordsCount } = this.state

    const currentUserPhrase = mnemonicWords.map(w => w.toLowerCase()).join(' ')
    const verified = isNew
      ? mnemonic === currentUserPhrase
      : mnemonicWords.reduce((acc, w) => acc + (w.length ? 1 : 0), 0) === wordsCount

    return (
      <Wrapper>
        {(wordsCount && (
          <Fragment>
            <UnderHeaderBlock>
              <Text>
                {isNew
                  ? 'Enter the paper key you have just written to verify its correctness.'
                  : 'Enter the paper key to continue.'}
              </Text>
            </UnderHeaderBlock>
            <KeyboardAwareScrollView
              innerRef={sv => (this._scrollView = sv)}
              style={{
                paddingLeft: 16,
                paddingRight: 16,
              }}
              keyboardShouldPersistTaps={'handled'}
              extraScrollHeight={8}
              enableResetScrollToCoords={false}
              keyboardOpeningTime={0}
            >
              <Words>
                {mnemonicWords.map((word: string, i: number) => {
                  return (
                    <MnemonicWordTextInput
                      key={i}
                      getRef={input => {
                        this._inputs[i] = input
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
                      onChange={value => {
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
              </Words>
              <Button
                testID="VerifyPaperKeyContinueButton"
                title="Continue"
                disabled={!verified}
                onPress={this._onContinuePress(currentUserPhrase)}
              />
              <Spacer />
            </KeyboardAwareScrollView>
          </Fragment>
        )) ||
          null}
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  ...state.wallet.walletInit,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  createWallet: (password, phrase, isNew) => {
    dispatch({ type: 'WALLET_INIT_REQUEST', password, phrase, isNew })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Verify)
