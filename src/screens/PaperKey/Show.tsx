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
import { ScrollView } from 'react-native'
import styled from 'styled-components/native'
import { Notice, Spacer } from 'src/common'
import { monoSpaceFont, Button } from 'src/components/CustomFont'
import { NavigationProps } from 'src/common/types'

interface OwnProps {
  mnemonic: string
  phrase: string
  generateSeed: (length: number) => void
}

type Props = NavigationProps<'ViewPaperKey'> & OwnProps

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

function Show({ route, navigation }: Props) {
  const { fromSettings, mnemonic } = route.params
  const mnemonicArr = mnemonic.split(' ')
  return (
    <Wrapper>
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
    </Wrapper>
  )
}

export default Show
