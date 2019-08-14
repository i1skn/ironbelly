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

import React, { useState } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import CheckBox from 'react-native-check-box'
import { Wrapper, Spacer } from 'common'
import { Text, Link, Button } from 'components/CustomFont'
import { type State as ReduxState, type Navigation } from 'common/types'

export const termsUrl = 'https://ironbelly.app/terms'
export const privacyUrl = 'https://ironbelly.app/privacy'
export const grinUrl = 'https://grin-tech.org/'

type Props = {
  accept: (buildNumber: number) => void,
  navigation: Navigation,
}

const RightText = styled.View`
  flex-wrap: wrap;
  flex-direction: row;
  flex: 1;
  padding-left: 16px;
`

const Main = styled.View`
  flex-wrap: wrap;
  flex-direction: row;
  flex: 1;
  padding-top: 16px;
`

const LegalDisclaimer = ({ navigation }: Props) => {
  const { nextScreen } = navigation.state.params
  const [checked, setChecked] = useState(false)
  return (
    <Wrapper>
      <Main>
        <Text fontSize={20}>Ironbelly - mobile wallet for </Text>
        <Link fontSize={20} url={grinUrl} title={'Grin'} />
        <Text fontSize={20}>. </Text>
        <Text fontSize={20}>
          Please, if you are not familiar with the blockchain technology, learn it first. It is
          important, that you know what you are doing!
        </Text>
        <Text fontSize={20}>
          Then read carefully Terms of Use and Privacy Policy and only then start using the app.
        </Text>
      </Main>
      <CheckBox
        style={{}}
        onClick={() => {
          setChecked(!checked)
        }}
        isChecked={checked}
        rightTextView={
          <RightText>
            <Text>I agree to the </Text>
            <Link url={termsUrl} title="Terms of Use" />
            <Text> and the </Text>
            <Link url={privacyUrl} title="Privacy Policy" />
            <Text>.</Text>
          </RightText>
        }
      />
      <Spacer />
      <Button
        testID="IAgree"
        title={'Next'}
        disabled={!checked}
        onPress={() => {
          navigation.navigate(nextScreen.name, nextScreen.params)
        }}
      />
      <Spacer />
    </Wrapper>
  )
}

LegalDisclaimer.navigationOptions = {
  title: 'Welcome',
  headerBackTitle: ' ',
}

const mapStateToProps = (state: ReduxState) => ({})

const mapDispatchToProps = (dispatch, ownProps) => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LegalDisclaimer)
