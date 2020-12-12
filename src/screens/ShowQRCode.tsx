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
import colors from 'src/common/colors'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Dimensions,
} from 'react-native'
import FontAwesome5Icons from 'react-native-vector-icons/FontAwesome5'
import { Text } from 'src/components/CustomFont'
import QRCode from 'react-native-qrcode-svg'
import { NavigationProps } from 'src/common/types'
import CardTitle from 'src/components/CardTitle'

interface OwnProps {}

type Props = NavigationProps<'ShowQRCode'> & OwnProps

function ScanQRCode({ route, navigation }: Props) {
  const { label, content } = route.params
  const width = Dimensions.get('window').width - 32
  return (
    <>
      <CardTitle title={label} navigation={navigation} />
      <View style={styles.container}>
        <QRCode value={content} size={width} />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 24,
  },
})

export default ScanQRCode
