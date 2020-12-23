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
import { Text, TextInput } from 'src/components/CustomFont'
import colors from 'src/common/colors'
import { StyleProp, TextStyle } from 'react-native'
type Props = {
  units?: string
  placeholder?: string
  maxLength: number
  value: string
  onChange: (value: string) => void
  autoFocus: boolean
  style?: StyleProp<TextStyle>
}
const Layout = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  flex-grow: 1;
  align-items: center;
`
const Spacer = styled(Text)`
  color: ${colors.black};
  font-size: 36;
  height: 58;
  line-height: 58;
`

const HiddenSpacer = styled(Text)`
  color: ${colors.surface};
  font-size: 36;
  height: 58;
  line-height: 58;
`

const StyledInput = styled(TextInput)`
  font-size: ${(props) => (props.value ? 36 : 36)};
  font-weight: ${(props) => (props.value ? 400 : 300)};
  color: ${colors.onSurface} 
  height: 68;
  text-align-vertical: center;
`
export default class NumericInput extends Component<Props> {
  render() {
    const {
      units,
      maxLength,
      style,
      onChange,
      value,
      autoFocus,
      placeholder,
    } = this.props
    return (
      <Layout style={style}>
        {units && <HiddenSpacer>{units}</HiddenSpacer>}
        <StyledInput
          selectionColor={colors.grey[700]}
          autoFocus={autoFocus}
          onChangeText={onChange}
          value={value}
          keyboardType="numeric"
          maxLength={maxLength}
          placeholder={placeholder}
        />
        {units && <Spacer>{units}</Spacer>}
      </Layout>
    )
  }
}
