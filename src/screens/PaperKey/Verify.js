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
// $FlowFixMe
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import MnemonicWordTextInput from 'components/MnemonicWordTextInput'

import { UnderHeaderBlock, FlexGrow, Spacer } from 'common'
import { Text, Button } from 'components/CustomFont'
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
          <Fragment>
            <UnderHeaderBlock>
              <Text>
                {newWallet
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
              extraHeight={8}
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
                onPress={() => {
                  navigation.navigate('WalletPrepare', { phrase: currentUserPhrase })
                }}
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
  mnemonic: state.wallet.walletInit.mnemonic,
  newWallet: state.wallet.walletInit.isNew,
})

const mapDispatchToProps = (dispatch, ownProps) => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Verify)
