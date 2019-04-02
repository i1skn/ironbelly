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
import { Keyboard, Alert } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import MnemonicWordTextInput from 'components/MnemonicWordTextInput'

import { Spacer } from 'common'
import colors from 'common/colors'
import { monoSpaceFont, Button } from 'components/CustomFont'
import { type State as ReduxState, type Navigation } from 'common/types'

type Props = {
  mnemonic: string,
  navigation: Navigation,
  newWallet: boolean,
}
type State = {
  inputValue: string,
  amount: number,
  valid: boolean,
  mnemonicWords: Array<string>,
  wordsCount: number,
}

const Wrapper = styled.View`
  flex: 1;
`

const Words = styled.View`
  margin: 16px 0;
`

class Verify extends Component<Props, State> {
  static navigationOptions = {
    title: 'Enter Paper Key',
  }

  state = {
    wordsCount: 0,
    inputValue: '',
    amount: 0,
    valid: false,
    mnemonicWords: [],
  }

  _inputs = []
  _scrollView = null

  componentDidMount() {
    // Only for testing
    //
    // this.setState({
    // wordsCount: 24,
    // mnemonicWords: (this.props.newWallet
    // ? this.props.mnemonic
    // : 'obtain long legal stadium stool gesture original depart rail run gate super quote old impact recipe marine unhappy census ski gown exist puzzle knock'
    // ).split(' '),
    // })
    if (!this.props.newWallet) {
      Alert.alert('Paper key', 'How many words in your paper key?', [
        {
          text: '12',
          onPress: () => {
            const wordsCount = 12
            this.setState({
              wordsCount,
              mnemonicWords: Array(wordsCount).fill(''),
            })
          },
        },
        {
          text: '24',
          onPress: () => {
            const wordsCount = 24
            this.setState({
              wordsCount,
              mnemonicWords: Array(wordsCount).fill(''),
            })
          },
        },
      ])
    } else {
      const wordsCount = 24
      this.setState({
        wordsCount,
        mnemonicWords: Array(wordsCount).fill(''),
      })
    }
  }

  componentDidUpdate(prevProps) {}

  render() {
    const { navigation, mnemonic, newWallet } = this.props
    const { mnemonicWords, wordsCount } = this.state

    const currentUserPhrase = mnemonicWords.map(w => w.toLowerCase()).join(' ')
    const verified = newWallet
      ? mnemonic === currentUserPhrase
      : mnemonicWords.reduce((acc, w) => acc + (w.length ? 1 : 0), 0) === wordsCount

    return (
      <Wrapper>
        {(wordsCount && (
          <KeyboardAwareScrollView
            getTextInputRefs={() => this._inputs}
            ref={sv => (this._scrollView = sv)}
            style={{
              paddingLeft: 16,
              paddingRight: 16,
            }}
          >
            <Words>
              {mnemonicWords.map((word: string, i: number) => {
                return (
                  <MnemonicWordTextInput
                    key={i}
                    getRef={input => {
                      this._inputs[i] = input
                    }}
                    number={i}
                    autoFocus={!i}
                    returnKeyType={i < wordsCount - 1 ? 'next' : 'done'}
                    onSubmitEditing={() => {
                      if (i < wordsCount - 1) {
                        this._inputs[i + 1].focus()
                      } else {
                        setTimeout(() => {
                          if (this._scrollView) {
                            this._scrollView.scrollToBottom()
                          }
                        }, 50)
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
              testID="VerifyPaperKeyFinishButton"
              title="Finish!"
              disabled={!verified}
              onPress={() => {
                navigation.navigate('WalletPrepare', { phrase: currentUserPhrase })
              }}
            />
            <Spacer />
          </KeyboardAwareScrollView>
        )) ||
          null}
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  mnemonic: state.wallet.walletInit.mnemonic,
  newWallet: state.wallet.walletInit.isNew,
})

const mapDispatchToProps = (dispatch, ownProps) => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Verify)
