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
import { ScrollView } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'

import { Spacer, colors } from 'common'
import { monoSpaceFont, Text, Button } from 'components/CustomFont'
import { type State as ReduxState, type Navigation } from 'common/types'

type Props = {
  mnemonic: string,
  phrase: string,
  navigation: Navigation,
}
type State = {
  inputValue: string,
  amount: number,
  valid: boolean,
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

class Show extends Component<Props, State> {
  static navigationOptions = {
    title: 'Paper key',
  }

  state = {
    inputValue: '',
    amount: 0,
    valid: false,
  }

  componentDidMount() {}

  componentDidUpdate(prevProps) {}

  render() {
    const { navigation, mnemonic, phrase } = this.props
    const mnemonicArr = (mnemonic || phrase).split(' ')

    return (
      <Wrapper>
        <Desc>
          <Text>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
            has been the industry's standard dummy text ever since the 1500s, when an unknown
            printer took
          </Text>
        </Desc>
        <ScrollView
          style={{
            paddingLeft: 16,
            paddingRight: 16,
          }}
          showsVerticalScrollIndicator={true}
        >
          <Words>
            {mnemonicArr.map((word: string, i: number) => {
              return (
                <Word key={i}>
                  <WordNumber>{i + 1}</WordNumber>
                  <WordText>{word}</WordText>
                </Word>
              )
            })}
          </Words>
          <Button
            testID="ShowPaperKeyFinishButton"
            title="Continue"
            disabled={false}
            onPress={() => {
              navigation.navigate('VerifyPaperKey')
            }}
          />
          <Spacer />
        </ScrollView>
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
)(Show)
