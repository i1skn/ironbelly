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

import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import styled from 'styled-components/native'
import CheckBox from 'react-native-check-box'
import { Wrapper, Spacer } from 'src/common'
import { Text, Link, Button } from 'src/components/CustomFont'
import { Dispatch, NavigationProps } from 'src/common/types'
import { connect } from 'react-redux'

interface OwnProps {
  acceptLegal: (value: boolean) => void
}

type Props = NavigationProps<'LegalDisclaimer'> & OwnProps

export const termsUrl = 'https://ironbelly.app/terms'
export const privacyUrl = 'https://ironbelly.app/privacy'
export const grinUrl = 'https://grin-tech.org/'

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

const LegalDisclaimer = ({ acceptLegal, navigation, route }: Props) => {
  const { nextScreen } = route?.params
  const [checked, setChecked] = useState(false)
  return (
    <Wrapper>
      <Main>
        <Text style={styles.text}>Ironbelly - mobile wallet for </Text>
        <Link style={styles.text} url={grinUrl} title={'Grin'} />
        <Text style={styles.text}>. </Text>
        <Text style={styles.text}>
          Please, if you are not familiar with the blockchain technology, learn
          it first. It is important, that you know what you are doing!
        </Text>
        <Text style={styles.text}>
          Then read carefully Terms of Use and Privacy Policy and only then
          start using the app.
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
          acceptLegal(true)
          navigation.navigate(nextScreen.name, nextScreen.params)
        }}
      />
      <Spacer />
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
  },
})

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  acceptLegal: (value: boolean) => {
    dispatch({
      type: 'ACCEPT_LEGAL',
      value,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(LegalDisclaimer)
