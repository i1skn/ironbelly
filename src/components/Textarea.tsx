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
import ReactNative, { TextInputProps, View, ViewProps } from 'react-native'
import { TextInput, Text } from 'src/components/CustomFont'
import colors from 'src/common/colors'
type Props = TextInputProps & {
  title?: string
  getRef?: (instance: ReactNative.TextInput | null) => void
  containerStyle?: ViewProps['style']
}
const StyledInput = styled(TextInput)`
  padding: 16px;
  background-color: ${colors.grey[200]};
  border-radius: 8;
  font-size: 18;
  font-weight: 400;
  flex: 1;
`
const Title = styled(Text)`
  font-weight: 500;
  font-size: 16;
  margin-bottom: 8;
`

export default class FormTextInput extends Component<Props> {
  render() {
    const { title, getRef, containerStyle, ...passProps } = this.props
    return (
      <View style={containerStyle}>
        {title && <Title>{title}</Title>}
        <StyledInput
          multiline={true}
          selectionColor={'#ABABAB'}
          ref={getRef}
          {...passProps}
        />
      </View>
    )
  }
}
