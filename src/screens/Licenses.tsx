/**
 * Copyright 2020 Ironbelly Devs
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

import React from 'react'
import IonicIcon from 'react-native-vector-icons/Ionicons'
import { Text } from 'src/components/CustomFont'
import licenses from '../../licenses.json'
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import {
  slightlyTransparent,
  styleSheetFactory,
  useThemedStyles,
} from 'src/themes'

// import { NavigationProps } from 'src/common/types'
// type Props = NavigationProps<'Licenses'>

type ItemProps = {title: string; licenceId: number};

const Item = ({ title, licenceId }: ItemProps) => {
  const [styles] = useThemedStyles(themedStyles)
  const navigation = useNavigation()
  const onPress = (licenceId: number) => {
    const licenseText = (licenses.licenses as Record<number, string>)[
      licenceId
    ]
    return () => navigation.navigate('License', { licenseText })
  }
  return (
    <TouchableOpacity onPress={onPress(licenceId)} style={styles.item}>
      <Text style={styles.itemTitle} ellipsizeMode="tail" numberOfLines={2}>
        {title}
      </Text>
      <IonicIcon
        style={styles.chevron}
        name="chevron-forward-outline"
        size={20}
      />
    </TouchableOpacity>
  )
}

function renderItem({ item }: {item: string}) {
  const licenceId = (licenses.packages as Record<string, number>)[item]
  return <Item title={item} licenceId={licenceId} />
}

const Licenses = () => {
  const [styles] = useThemedStyles(themedStyles)
  const packages = Object.keys(licenses.packages)
  packages.sort()
  return (
    <FlatList
      style={styles.container}
      initialNumToRender={30}
      keyboardShouldPersistTaps={'handled'}
      data={packages}
      renderItem={renderItem}
      keyExtractor={(item: string) => item}
    />
  )
}

const themedStyles = styleSheetFactory(theme => ({
  container: {
    paddingHorizontal: 16,
  },
  item: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    color: slightlyTransparent(theme.onBackground),
    lineHeight: 30,
  },
  itemTitle: {
    flex: 1,
    color: theme.onBackground,
  },
}))

export default Licenses
