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

import React, { Component } from 'react'
import styled from 'styled-components/native'
import { monoSpaceFont, TextInput, Text } from 'src/components/CustomFont'
import ReactNative, {
  NativeSyntheticEvent,
  ReturnKeyTypeOptions,
  TextInputSubmitEditingEventData,
} from 'react-native'
import { styleSheetFactory, useThemedStyles } from 'src/themes'
type Props = {
  testID?: string
  value: string
  returnKeyType?: ReturnKeyTypeOptions
  number: number
  onChange: (value: string) => void
  getRef?: (instance: ReactNative.TextInput | null) => void
  onSubmitEditing: (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
  ) => void
  autoFocus: boolean
}
const Layout = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
`
const StyledInput = styled(TextInput)`
  font-family: ${monoSpaceFont};
  padding: 8px 8px 8px 0;
  border-bottom-width: 1;
  border-bottom-color: #bbbbbb;
  font-size: 24px;
  font-weight: 400;
  flex-grow: 1;
`
const WordNumber = styled(Text)`
  color: #bbbbbb;
  padding: 8px 16px 8px 0;
  font-size: 24px;
  font-family: ${monoSpaceFont};
`

const themedStyles = styleSheetFactory(() => ({}))
export default class FormTextInput extends Component<Props> {
  render() {
    const [, theme] = useThemedStyles(themedStyles)
    const {
      onChange,
      onSubmitEditing,
      value,
      testID,
      number,
      returnKeyType,
      getRef,
      autoFocus,
    } = this.props
    return (
      <Layout>
        <WordNumber>{number + 1}</WordNumber>
        <StyledInput
          selectionColor={'#ABABAB'}
          returnKeyType={returnKeyType}
          secureTextEntry={false}
          autoFocus={autoFocus}
          ref={getRef}
          onChangeText={onChange}
          onSubmitEditing={onSubmitEditing}
          value={value}
          maxLength={1000}
          placeholder={''}
          testID={testID}
          keyboardType={'default'}
          autoCorrect={false}
          autoCapitalize={'none'}
          style={{ color: theme.onBackground }}
        />
      </Layout>
    )
  }
}
