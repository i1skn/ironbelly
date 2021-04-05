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
import CheckBox from 'react-native-check-box'
import { Wrapper, Spacer } from 'src/common'
import { Text, Link, Button } from 'src/components/CustomFont'
import { Dispatch, NavigationProps } from 'src/common/types'
import { connect } from 'react-redux'
import { styleSheetFactory, useThemedStyles } from 'src/themes'
import { View } from 'react-native'

interface OwnProps {
  acceptLegal: (value: boolean) => void
}

type Props = NavigationProps<'LegalDisclaimer'> & OwnProps

export const termsUrl = 'https://ironbelly.app/terms'
export const privacyUrl = 'https://ironbelly.app/privacy'
export const grinUrl = 'https://grin-tech.org/'

const LegalDisclaimer = ({ acceptLegal, navigation, route }: Props) => {
  const { nextScreen } = route?.params
  const [checked, setChecked] = useState(false)
  const [styles, theme] = useThemedStyles(themedStyles)
  return (
    <Wrapper>
      <View style={styles.main}>
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
      </View>
      <CheckBox
        checkBoxColor={theme.secondary}
        onClick={() => {
          setChecked(!checked)
        }}
        isChecked={checked}
        rightTextView={
          <View style={styles.rightText}>
            <Text style={styles.checkboxText}>I agree to the </Text>
            <Link url={termsUrl} title="Terms of Use" />
            <Text style={styles.checkboxText}> and the </Text>
            <Link url={privacyUrl} title="Privacy Policy" />
            <Text style={styles.checkboxText}>.</Text>
          </View>
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

const themedStyles = styleSheetFactory((theme) => ({
  main: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    flex: 1,
    paddingTop: 16,
  },
  text: {
    fontSize: 20,
    color: theme.onBackground,
  },
  checkboxText: {
    color: theme.onBackground,
  },
  rightText: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    flex: 1,
    paddingLeft: 16,
  },
}))

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
