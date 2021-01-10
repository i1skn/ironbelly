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

import React, { useCallback } from 'react'
import {
  TouchableOpacity,
  StatusBar,
  Text,
  View,
  ViewProps,
} from 'react-native'
import FeatherIcon from 'react-native-vector-icons/Feather'
import { isAndroid } from 'src/common'
import {
  useFocusEffect,
  NavigationProp,
  ParamListBase,
} from '@react-navigation/native'
import {
  slightlyTransparent,
  styleSheetFactory,
  useTheme,
  useThemedStyles,
} from 'src/themes'

type Props = {
  title: string
  subTitle?: string
  navigation: NavigationProp<ParamListBase>
  style?: ViewProps['style']
}

const themedStyles = styleSheetFactory((theme) => ({
  cardTitle: {
    paddingVertical: 16,
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: theme.surface,
  },
  container: {
    flexDirection: 'column',
  },
  chevron: {
    position: 'absolute',
    paddingLeft: 16,
    top: 0,
    left: 0,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
    color: theme.onBackground,
  },
  subTitle: {
    fontSize: 14,
    textAlign: 'center',
    color: slightlyTransparent(theme.onBackground),
  },
}))

export default ({ title, subTitle, navigation, style }: Props) => {
  if (isAndroid) {
    return null
  }
  const [styles] = useThemedStyles(themedStyles)
  const [theme, themeName] = useTheme()

  useFocusEffect(
    useCallback(() => {
      if (themeName === 'light') {
        StatusBar.setBarStyle('light-content')
      }
      return () => {
        if (themeName === 'light') {
          StatusBar.setBarStyle('dark-content')
        }
      }
    }, []),
  )

  return (
    <View style={style}>
      <View style={styles.cardTitle}>
        <TouchableOpacity
          style={[styles.chevron, { paddingTop: (subTitle && 24) || 16 }]}
          testID="GoBackChevron"
          onPress={() => {
            navigation.goBack()
          }}>
          <FeatherIcon
            name="chevron-down"
            color={theme.onBackground}
            size={24}
          />
        </TouchableOpacity>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          {subTitle && <Text style={styles.subTitle}>{subTitle}</Text>}
        </View>
      </View>
    </View>
  )
}
