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
import { Text } from 'components/CustomFont'
import Icon from 'react-native-vector-icons/Ionicons'
import styled from 'styled-components/native'
import colors from 'common/colors'
import { FlexGrow } from 'common'

const Wrapper = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: flex-end;
  padding: 12px 0;
  border-bottom-width: 1;
  border-bottom-color: ${colors.grey[200]};
`
const Title = styled(Text)`
  font-size: 18;
  color: ${({ color }) => (color ? color : colors.grey[800])};
`
const Value = styled(Text)`
  padding-right: 16px;
  font-weight: 700;
`

const ChevronIcon = styled(Icon)`
  color: ${colors.grey[500]};
  padding-right: 16px;
`

type Props = {
  title: string,
  value?: string,
  titleStyle?: any,
  hideChevron?: boolean,
  onPress: () => void,
}
const SettingsListItem = ({ title, titleStyle, value, onPress, hideChevron }: Props) => {
  return (
    <Wrapper onPress={onPress}>
      <Title style={titleStyle}>{title}</Title>
      <FlexGrow />
      {value && <Value>{value}</Value>}
      {!hideChevron && <ChevronIcon name="ios-arrow-forward" size={20} />}
    </Wrapper>
  )
}

export default SettingsListItem
