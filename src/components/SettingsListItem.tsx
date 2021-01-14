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
import {
  StyleProp,
  Switch,
  TextStyle,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native'
import { Text } from 'src/components/CustomFont'
import IonicIcon from 'react-native-vector-icons/Ionicons'
import FeatherIcon from 'react-native-vector-icons/Feather'
import { FlexGrow } from 'src/common'
import {
  slightlyTransparent,
  styleSheetFactory,
  useThemedStyles,
} from 'src/themes'

export type Props = {
  title: string
  value?: string | boolean
  titleStyle?: StyleProp<TextStyle>
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
  const [styles, theme] = useThemedStyles(themedStyles)
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={!isSwitch ? onPress : undefined}>
        {isLink && (
          <FeatherIcon style={styles.externalLink} name="link" size={20} />
        )}
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        <FlexGrow />
        {!isSwitch && <Text style={styles.value}>{value}</Text>}
        {!hideChevron && (
          <IonicIcon
            style={styles.chevronIcon}
            name="ios-chevron-forward"
            size={20}
          />
        )}
        {isSwitch && (
          <Switch
            style={styles.toggle}
            trackColor={{
              true:
                Platform.select({
                  android: theme.secondaryUltraLight,
                  ios: theme.secondary,
                }) ?? '',
              false: theme.background,
            }}
            thumbColor={Platform.select({
              android: theme.secondary,
              ios: theme.background,
            })}
            value={!!value}
            onValueChange={onValueChange}
          />
        )}
      </TouchableOpacity>
    </View>
  )
}

const themedStyles = styleSheetFactory((theme) => ({
  wrapper: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 0,
    paddingVertical: 12,
    backgroundColor: theme.surface,
  },
  touchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    lineHeight: 30,
    color: theme.onBackground,
  },
  value: {
    paddingRight: 16,
    lineHeight: 30,
    fontSize: 18,
    color: theme.secondary,
  },
  chevronIcon: {
    color: slightlyTransparent(theme.onBackground),
    lineHeight: 30,
    paddingRight: 16,
  },
  externalLink: {
    color: theme.onBackground,
    lineHeight: 30,
    paddingRight: 16,
  },
  toggle: {
    marginRight: 16,
  },
}))

export default SettingsListItem
