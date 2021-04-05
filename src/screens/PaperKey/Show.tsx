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

import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { Spacer } from 'src/common'
import Notice from 'src/components/Notice'
import { monoSpaceFont, Button } from 'src/components/CustomFont'
import { NavigationProps } from 'src/common/types'
import {
  slightlyTransparent,
  styleSheetFactory,
  useThemedStyles,
} from 'src/themes'

interface OwnProps {
  mnemonic: string
  phrase: string
  generateSeed: (length: number) => void
}

type Props = NavigationProps<'ViewPaperKey'> & OwnProps

function Show({ route, navigation }: Props) {
  const [styles] = useThemedStyles(themedStyles)
  const { fromSettings, mnemonic } = route.params
  const mnemonicArr = mnemonic.split(' ')
  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={{
          paddingLeft: 16,
          paddingRight: 16,
        }}
        testID="ShowPaperKeyScrollView"
        showsVerticalScrollIndicator={true}>
        <Notice>
          Your paper key is the only way to restore your Grin wallet if your
          phone is lost, stolen, broken, or upgraded.
          {!fromSettings &&
            ' It consists of 24 words. Please write them down on a piece of paper and keep safe.'}
        </Notice>
        <View style={styles.words}>
          {mnemonicArr.map((word: string, i: number) => {
            return (
              <View style={styles.word} key={i}>
                <Text style={styles.wordNumber}>{i + 1}</Text>
                <Text style={styles.wordText} testID={`Word${i + 1}`}>
                  {word}
                </Text>
              </View>
            )
          })}
        </View>
        {!fromSettings && (
          <Button
            testID="ShowPaperKeyContinueButton"
            title="Continue"
            disabled={false}
            onPress={() => {
              if (route.params.password) {
                navigation.navigate('VerifyPaperKey', {
                  title: 'Verify Paper key',
                  wordsCount: 24,
                  mnemonic,
                  password: route.params.password,
                })
              }
            }}
          />
        )}
        <Spacer />
      </ScrollView>
    </View>
  )
}

const themedStyles = styleSheetFactory((theme) => ({
  wrapper: {
    flex: 1,
  },
  words: {
    marginVertical: 16,
    marginHorizontal: 0,
  },
  word: {
    flexDirection: 'row',
    marginTop: 0,
    marginBottom: 4,
  },
  wordText: {
    paddingVertical: 8,
    paddingLeft: 16,
    fontSize: 24,
    color: theme.onBackground,
    fontFamily: monoSpaceFont,
  },
  wordNumber: {
    color: slightlyTransparent(theme.onBackground),
    paddingVertical: 8,
    fontSize: 24,
    fontFamily: monoSpaceFont,
  },
}))

export default Show
