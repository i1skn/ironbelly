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

import * as React from 'react'
import styled from 'styled-components/native'
import { Text as NativeText } from 'react-native'
import { colors } from 'common'

const fontFamily = 'font-family: Poppins'
export const Text = styled.Text`
  ${fontFamily};
`

export const TextInput = styled.TextInput`
  ${fontFamily};
`

function getBackgroundColor(props: any) {
  return props.inverted ? 'white' : props.danger ? colors.warning : colors.primary
}

const StyledButton = styled.TouchableOpacity`
  padding: 10px 15px;
  background-color: ${props => getBackgroundColor(props)};
  border-radius: 8;
  border-width: ${props => (props.inverted ? '1' : '0')};
  opacity: ${props => (props.disabled ? '0.3' : '1')};
`

const ButtonTitle = styled(Text)`
  font-size: 21;
  font-weight: 500;
  width: auto;
  text-align: center;
  color: ${props => (props.danger ? '#FFF' : '#000')};
`
export const Button = (props: any) => {
  return (
    <StyledButton {...props}>
      <ButtonTitle danger={props.danger}>{props.title}</ButtonTitle>
    </StyledButton>
  )
}
