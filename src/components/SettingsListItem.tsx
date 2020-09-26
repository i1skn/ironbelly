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
import { Switch } from 'react-native'
import { Text } from 'src/components/CustomFont'
import Icon from 'react-native-vector-icons/Ionicons'
import styled from 'styled-components/native'
import colors from 'src/common/colors'
import { FlexGrow } from 'src/common'
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
  color: ${colors.grey[500]};
`
const ChevronIcon = styled(Icon)`
  color: ${colors.grey[500]};
  padding-right: 16px;
`
const StyledSwitch = styled(Switch)`
  margin-right: 16px;
`
export type Props = {
  title: string
  value?: string | boolean
  titleStyle?: any
  hideChevron?: boolean
  onPress?: () => void
  onValueChange?: (value: boolean) => void
}

const SettingsListItem = ({
  title,
  titleStyle,
  value,
  onPress,
  hideChevron,
  onValueChange,
}: Props) => {
  const isSwitch = typeof value === 'boolean'
  return (
    <Wrapper onPress={!isSwitch ? onPress : null}>
      <Title style={titleStyle}>{title}</Title>
      <FlexGrow />
      {!isSwitch && <Value>{value}</Value>}
      {!hideChevron && <ChevronIcon name="ios-chevron-forward" size={20} />}
      {isSwitch && <StyledSwitch value={value} onValueChange={onValueChange} />}
    </Wrapper>
  )
}

export default SettingsListItem
