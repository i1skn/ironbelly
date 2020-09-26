import React, { Component } from 'react'
import styled from 'styled-components/native'
import { TextInputProps, View, ViewProps } from 'react-native'
import { TextInput, Text } from 'src/components/CustomFont'
import colors from 'src/common/colors'
type Props = TextInputProps & {
  title?: string
  getRef?: (a: any) => void
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
    const { title, getRef, containerStyle } = this.props
    return (
      <View style={containerStyle}>
        {title && <Title>{title}</Title>}
        <StyledInput
          {...this.props}
          multiline={true}
          selectionColor={'#ABABAB'}
          ref={getRef}
        />
      </View>
    )
  }
}
