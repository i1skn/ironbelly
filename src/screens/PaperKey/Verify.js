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
import { ScrollView, Keyboard } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import MnemonicWordTextInput from 'components/MnemonicWordTextInput'

import { Spacer, colors } from 'common'
import { monoSpaceFont, Button } from 'components/CustomFont'
import { type State as ReduxState, type Navigation } from 'common/types'

const WORDS_COUNT = 24

type Props = {
  mnemonic: string,
  phrase: string,
  navigation: Navigation,
}
type State = {
  inputValue: string,
  amount: number,
  valid: boolean,
  mnemonicWords: Array<string>,
}

const Wrapper = styled.View`
  flex: 1;
`

const Desc = styled.View`
  background-color: ${colors.accent};
  padding: 0 16px 16px 16px;
`

const Words = styled.View`
  margin: 16px 0;
`

const Word = styled.View`
  flex-direction: row;
  margin: 0 4px;
`

const WordText = styled.Text`
  padding: 8px 0 8px 16px;
  font-size: 24px;
  font-family: ${monoSpaceFont};
`

const WordNumber = styled.Text`
  color: #bbbbbb;
  padding: 8px 0;
  font-size: 24px;
  font-family: ${monoSpaceFont};
`

class Verify extends Component<Props, State> {
  static navigationOptions = {
    title: 'Verify Paper Key',
  }

  state = {
    inputValue: '',
    amount: 0,
    valid: false,
    mnemonicWords: Array(WORDS_COUNT).fill(''),
  }

  _inputs = []
  _scrollView = null

  componentDidMount() {
    this.setState({
      mnemonicWords: this.props.mnemonic.split(' '),
    })
  }

  componentDidUpdate(prevProps) {}

  render() {
    const { navigation, mnemonic } = this.props
    const { mnemonicWords } = this.state

    const verified = mnemonic === mnemonicWords.join(' ')
    return (
      <Wrapper>
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
                  returnKeyType={i < WORDS_COUNT - 1 ? 'next' : 'done'}
                  onSubmitEditing={() => {
                    if (i < WORDS_COUNT - 1) {
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
            title="Finish"
            disabled={!verified}
            onPress={() => {
              navigation.navigate('Main')
            }}
          />
          <Spacer />
        </KeyboardAwareScrollView>
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  mnemonic: state.wallet.walletInit.mnemonic,
  phrase: state.wallet.walletPhrase.phrase,
})

const mapDispatchToProps = (dispatch, ownProps) => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Verify)
