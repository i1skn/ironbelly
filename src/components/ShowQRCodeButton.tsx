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
import { TouchableOpacity, Platform } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import { Text } from 'src/components/CustomFont'
import { useNavigation } from '@react-navigation/native'
import { styleSheetFactory, useThemedStyles } from 'src/themes'

function ShowQRCodeButton({
  label,
  content,
}: {
  label: string
  content: string
}) {
  const [styles] = useThemedStyles(themedStyles)
  const navigation = useNavigation()
  const show = (content: string, label: string) => {
    return () => {
      navigation.navigate('ShowQRCode', {
        content,
        label,
      })
    }
  }

  return (
    <TouchableOpacity onPress={show(content, label)}>
      <Text style={styles.slatepackHeaderCopy}>
        Show QR{' '}
        <MaterialCommunityIcons name="qrcode" size={18} style={styles.icon} />
      </Text>
    </TouchableOpacity>
  )
}

const themedStyles = styleSheetFactory((theme) => ({
  slatepackHeaderCopy: {
    fontWeight: Platform.select({ android: '700', ios: '500' }),
    color: theme.link,
    fontSize: 16,
  },
  icon: {
    color: theme.link,
  },
}))

export default ShowQRCodeButton
