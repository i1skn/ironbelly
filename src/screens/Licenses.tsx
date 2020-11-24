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

import colors from 'src/common/colors'
import React from 'react'
import IonicIcon from 'react-native-vector-icons/Ionicons'
import { Wrapper } from 'src/common'
import { Text } from 'src/components/CustomFont'
import { NavigationProps } from 'src/common/types'
import licenses from '../../licenses.json'
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'

type Props = NavigationProps<'Licenses'>

type ItemProps = { title: string; licenceId: number }

const Item = ({ title, licenceId }: ItemProps) => {
  const navigation = useNavigation()
  const onPress = (licenceId: number) => {
    const licenseText = (licenses.licenses as Record<number, string>)[licenceId]
    return () => navigation.navigate('License', { licenseText })
  }
  return (
    <TouchableOpacity onPress={onPress(licenceId)} style={styles.item}>
      <Text style={styles.itemTitle} ellipsizeMode="tail" numberOfLines={2}>
        {title}
      </Text>
      <IonicIcon style={styles.chevron} name="ios-chevron-forward" size={20} />
    </TouchableOpacity>
  )
}

function renderItem({ item }: { item: string }) {
  const licenceId = (licenses.packages as Record<string, number>)[item]
  return <Item title={item} licenceId={licenceId} />
}

const Licenses = (_props: Props) => {
  let packages = Object.keys(licenses.packages)
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  item: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    color: colors.onBackgroundLight,
    lineHeight: 30,
  },
  itemTitle: {
    flex: 1,
  },
})

export default Licenses
