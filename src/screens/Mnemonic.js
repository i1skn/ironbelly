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
import { KeyboardAvoidingView, View } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import HeaderSpan from 'components/HeaderSpan'

import { Title, SubTitle, Spacer } from 'common'
import { Text, Button } from 'components/CustomFont'
import { type State as ReduxState, type Navigation } from 'common/types'

//Images
import ChevronLeftImg from 'assets/images/ChevronLeft.png'

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

const Wrapper = styled(KeyboardAvoidingView)`
  padding: 20px;
  flex-grow: 1;
`

const Header = styled.TouchableOpacity`
  height: 40;
  margin-top: 10;
  width: 100%;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20;
`

const HeaderBackIcon = styled.Image`
  margin-right: 16;
  height: 19;
  width: 10;
  margin-left: 4;
`

const HeaderText = styled(Text)`
  font-size: 18;
  margin-top: 2;
`

const Finish = styled(Button)``

const PhraseWord12 = styled(Text)`
  width: 50%;
  font-size: 18;
  line-height: 35;
`
const PhraseWord24 = styled(Text)`
  width: 50%;
  font-size: 14;
  line-height: 22;
`
const PhraseWordNumber = styled(Text)`
  color: #bbbbbb;
`
const Phrase12 = styled.View`
  width: 100%;
  flex-wrap: wrap;
  height: 250;
  padding-left: 20;
`

const Phrase24 = styled.View`
  width: 100%;
  flex-wrap: wrap;
  height: 300;
  padding-left: 20;
  margin-top: -20px;
`

class Mnemonic extends Component<Props, State> {
  static navigationOptions = {
    header: null,
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
    const isShort = mnemonicArr.length === 12

    return (
      <Wrapper behavior="padding">
        <HeaderSpan />
        {false && (
          <Header onPress={() => navigation.goBack()}>
            <HeaderBackIcon source={ChevronLeftImg} />

            <HeaderText>Back</HeaderText>
          </Header>
        )}

        <View style={{ flexGrow: 1, marginTop: 20 }}>
          <Title>This is your recovery phrase</Title>
          <SubTitle>
            Please make sure to write it down exactly as shown here and store somewhere offline.
          </SubTitle>
          <View style={{ flexGrow: 1, justifyContent: 'center' }}>
            {(isShort && (
              <Phrase12>
                {mnemonicArr.map((word: string, i: number) => {
                  return (
                    <PhraseWord12 key={i}>
                      <PhraseWordNumber>{i + 1}.</PhraseWordNumber> {word}
                    </PhraseWord12>
                  )
                })}
              </Phrase12>
            )) || (
              <Phrase24>
                {mnemonicArr.map((word: string, i: number) => {
                  return (
                    <PhraseWord24 key={i}>
                      <PhraseWordNumber>{i + 1}.</PhraseWordNumber> {word}
                    </PhraseWord24>
                  )
                })}
              </Phrase24>
            )}
          </View>
        </View>
        <Finish
          title="I’ve written it down"
          disabled={false}
          onPress={() => {
            navigation.navigate('Main')
          }}
        />
        <Spacer />
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
)(Mnemonic)
