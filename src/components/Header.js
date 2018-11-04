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
import { Text } from 'components/CustomFont'
import HeaderSpan from 'components/HeaderSpan'

const Body = styled.View`
  height: 69;
  width: 100%;
  flex-direction: row;
  padding: 35px 16px 14px 16px;
  align-items: center;
`

const Left = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`

const LeftIcon = styled.Image`
  height: 20;
  width: 20;
`

const LeftText = styled(Text)`
  font-size: 18;
  margin-top: 2;
  margin-left: 6;
  line-height: 20;
`

const Title = styled.View`
  width: 100%;
  position: absolute;
  top: 30;
  left: 16;
  align-items: center;
`

const TitleText = styled(Text)`
  font-size: 20;
  font-weight: 600;
`

type Props = {
  leftIcon?: number,
  leftText?: string,
  leftAction?: () => void,
  title?: string,
}
type State = {}
export default class Header extends Component<Props, State> {
  render() {
    const { leftIcon, leftText, leftAction, title } = this.props
    return (
      <React.Fragment>
        <HeaderSpan />
        <Body>
          <Title>
            <TitleText>{title}</TitleText>
          </Title>
          <Left onPress={leftAction}>
            {leftIcon && <LeftIcon source={leftIcon} />}
            {leftText && <LeftText>{leftText}</LeftText>}
          </Left>
        </Body>
      </React.Fragment>
    )
  }
}
