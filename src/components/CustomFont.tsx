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

import * as React from 'react'
import styled from 'styled-components/native'
import colors from 'src/common/colors'
import ReactNative, { Linking, StyleProp, TextStyle } from 'react-native'
import { slightlyTransparent } from 'src/themes'
export const monoSpaceFont = 'Menlo'
export const Text = styled.Text<{ fontSize?: string }>`
  font-size: ${(props) => props.fontSize ?? '16px'};
  font-weight: normal;
  color: ${() => colors.black};
`
export const Link = (props: {
  url: string
  title: string | React.ReactElement
  style?: StyleProp<TextStyle>
}) => {
  const { url, title } = props
  return (
    <Text
      {...props}
      style={[
        {
          color: colors.link,
        },
        props.style,
      ]}
      onPress={() => Linking.openURL(url)}>
      {title}
    </Text>
  )
}

export const TextInput = styled.TextInput.attrs((props) => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placeholderTextColor:
    props.placeholderTextColor || slightlyTransparent(props.theme.placeholder),
}))`
  font-weight: normal;
`

function getBackgroundColor(props: StyledButtonProps) {
  return props.inverted
    ? 'white'
    : props.danger
    ? colors.warning
    : colors.primary
}

type StyledButtonProps = { inverted?: boolean; danger?: boolean }
const StyledButton = styled.TouchableOpacity<StyledButtonProps>`
  padding: 10px 15px;
  background-color: ${(props) => getBackgroundColor(props)};
  border-radius: 8;
  border-width: ${(props) => (props.inverted ? '1' : '0')};
  opacity: ${(props) => (props.disabled ? '0.3' : '1')};
`
const ButtonTitle = styled(Text)<StyledButtonProps>`
  font-size: 21;
  font-weight: 500;
  width: auto;
  text-align: center;
  color: ${(props) => (props.danger ? '#FFF' : colors.onPrimary)};
`

type ButtonProps = { title: string | JSX.Element } & StyledButtonProps &
  ReactNative.TouchableOpacityProps
export const Button = (props: ButtonProps) => {
  const isTitleString = typeof props.title === 'string'
  return (
    <StyledButton {...props}>
      {(isTitleString && (
        <ButtonTitle danger={props.danger}>{props.title}</ButtonTitle>
      )) ||
        props.title}
    </StyledButton>
  )
}
