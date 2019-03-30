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
import styled from 'styled-components/native'
import { monoSpaceFont, TextInput, Text } from 'components/CustomFont'

type Props = {
  testID?: string,
  value: string,
  returnKeyType: string,
  number: number,
  onChange: (value: string) => void,
  getRef: any => void,
  onSubmitEditing: any => void,
}
type State = {}

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

export default class FormTextInput extends Component<Props, State> {
  render() {
    const { onChange, onSubmitEditing, value, testID, number, returnKeyType, getRef } = this.props
    return (
      <Layout>
        <WordNumber>{number + 1}</WordNumber>
        <StyledInput
          selectionColor={'#ABABAB'}
          returnKeyType={returnKeyType}
          secureTextEntry={false}
          autoFocus={false}
          ref={getRef}
          onChangeText={onChange}
          onSubmitEditing={onSubmitEditing}
          value={value}
          maxLength={1000}
          placeholder={''}
          testID={testID}
          keyboardType={'default'}
          autoCorrect={false}
        />
      </Layout>
    )
  }
}
