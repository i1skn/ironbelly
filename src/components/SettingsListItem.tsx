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
import { Switch } from 'react-native'
import { Text } from 'src/components/CustomFont'
import IonicIcon from 'react-native-vector-icons/Ionicons'
import FeatherIcon from 'react-native-vector-icons/Feather'
import styled from 'styled-components/native'
import colors from 'src/common/colors'
import { FlexGrow } from 'src/common'

const Wrapper = styled.View`
  flex: 1;
  padding: 12px 0 12px 16px;
  background-color: ${colors.surface};
`
const Touchable = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: flex-end;
`
const Title = styled(Text)<{ color?: string }>`
  font-size: 18;
  line-height: 30;
  color: ${({ color }) => color ?? colors.onBackground};
`
const Value = styled(Text)`
  padding-right: 16px;
  line-height: 30;
  font-size: 18;
  color: ${colors.secondary};
`
const ChevronIcon = styled(IonicIcon)`
  color: ${colors.onBackgroundLight};
  line-height: 30;
  padding-right: 16px;
`
const ExternalLinkIcon = styled(FeatherIcon)`
  color: ${colors.onBackground};
  line-height: 30;
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
  isLink?: boolean
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
  isLink,
}: Props) => {
  const isSwitch = typeof value === 'boolean'
  return (
    <Wrapper>
      <Touchable onPress={!isSwitch ? onPress : undefined}>
        {isLink && <ExternalLinkIcon name="link" size={20} />}
        <Title style={titleStyle}>{title}</Title>
        <FlexGrow />
        {!isSwitch && <Value>{value}</Value>}
        {!hideChevron && <ChevronIcon name="ios-chevron-forward" size={20} />}
        {isSwitch && (
          <StyledSwitch
            trackColor={{
              true: Platform.select({
                android: colors.secondaryUltraLight,
                ios: colors.secondary,
              }),
              false: colors.grey[100],
            }}
            thumbColor={Platform.select({
              android: colors.secondary,
              ios: colors.white,
            })}
            value={!!value}
            onValueChange={onValueChange}
          />
        )}
      </Touchable>
    </Wrapper>
  )
}

export default SettingsListItem
