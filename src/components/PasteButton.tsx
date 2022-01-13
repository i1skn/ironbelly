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
import Clipboard from '@react-native-clipboard/clipboard'
import { TouchableOpacity, Platform } from 'react-native'
import FontAwesome5Icons from 'react-native-vector-icons/FontAwesome5'
import { Text } from 'src/components/CustomFont'
import { styleSheetFactory, useThemedStyles } from 'src/themes'

export type SetFunction = (s: string) => void

type Props = {
  setFunction: SetFunction
}
function PasteButton({ setFunction }: Props) {
  const [styles] = useThemedStyles(themedStyles)
  const pasteToClipboard = () => {
    Clipboard.getString().then(setFunction)
  }

  return (
    <TouchableOpacity onPress={pasteToClipboard}>
      <Text style={styles.button}>
        Paste <FontAwesome5Icons name="paste" size={18} style={styles.icon} />
      </Text>
    </TouchableOpacity>
  )
}

const themedStyles = styleSheetFactory(theme => ({
  button: {
    fontWeight: Platform.select({ android: '700', ios: '500' }),
    color: theme.link,
    fontSize: 16,
  },
  icon: {
    color: theme.link,
  },
}))

export default PasteButton
