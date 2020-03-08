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
import { ScrollView } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import { UnderHeaderBlock, Spacer } from 'src/common'
import { monoSpaceFont, Text, Button } from 'src/components/CustomFont'
import { State as ReduxState, Navigation } from 'src/common/types'
type Props = {
  mnemonic: string
  phrase: string
  navigation: Navigation
  generateSeed: (length: number) => void
}
type State = {
  fromSettings: boolean
}
const Wrapper = styled.View`
  flex: 1;
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

class Show extends Component<Props, State> {
  static navigationOptions = {
    title: 'Paper key',
  }

  constructor(props) {
    super(props)
    const fromSettings = props.navigation.state.params && props.navigation.state.params.fromSettings
    this.state = {
      fromSettings,
    }
  }

  componentDidMount() {
    if (!this.props.mnemonic && !this.state.fromSettings) {
      this.props.generateSeed(32)
    }
  }

  componentDidUpdate(prevProps: Props) {}

  render() {
    const { navigation, mnemonic, phrase } = this.props
    const mnemonicArr = (mnemonic || phrase).split(' ')
    const { fromSettings } = this.state
    return (
      <Wrapper>
        <UnderHeaderBlock>
          <Text>
            Your paper key is the only way to restore your Grin wallet if your phone is lost,
            stolen, broken, or upgraded.
            {!fromSettings &&
              ' It consists of 24 words. Please write them down on a piece of paper and keep safe.'}
          </Text>
        </UnderHeaderBlock>
        <ScrollView
          style={{
            paddingLeft: 16,
            paddingRight: 16,
          }}
          testID="ShowPaperKeyScrollView"
          showsVerticalScrollIndicator={true}>
          <Words>
            {mnemonicArr.map((word: string, i: number) => {
              return (
                <Word key={i}>
                  <WordNumber>{i + 1}</WordNumber>
                  <WordText testID={`Word${i + 1}`}>{word}</WordText>
                </Word>
              )
            })}
          </Words>
          {!fromSettings && (
            <Button
              testID="ShowPaperKeyContinueButton"
              title="Continue"
              disabled={false}
              onPress={() => {
                navigation.navigate('VerifyPaperKey', {
                  title: 'Verify Paper key ',
                })
              }}
            />
          )}
          <Spacer />
        </ScrollView>
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  mnemonic: state.wallet.walletInit.mnemonic,
  phrase: state.wallet.walletPhrase.phrase,
}) //

const mapDispatchToProps = (dispatch, ownProps) => ({
  generateSeed: length => {
    dispatch({
      type: 'SEED_NEW_REQUEST',
      length,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Show)
