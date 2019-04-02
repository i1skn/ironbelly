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
import { View } from 'react-native'
import { Text } from 'components/CustomFont'
import HeaderSpan from 'components/HeaderSpan'
import styled from 'styled-components/native'
import colors from 'common/colors'

const Title = styled(Text)`
  font-weight: 600;
  font-size: 21;
  padding-bottom: 10;
  padding-top: 30;
`
const Wrapper = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding-left: 16px;
  padding-right: 16px;
  border-bottom-color: #dedede;
  border-bottom-width: 1;
  background-color: ${() => colors.primary};
`
type Props = {}

const RecoveryProgress = (props: Props) => {
  return (
    <Wrapper>
      <View style={{}}>
        <HeaderSpan />
        <Title>Recovery in progress . . .</Title>
      </View>
    </Wrapper>
  )
}

export default RecoveryProgress
