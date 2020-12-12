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
import { StyleSheet, View } from 'react-native'
import PasteButton, { SetFunction } from 'src/components/PasteButton'
import OpenFileButton from 'src/components/OpenFileButton'
import ScanQRCodeButton from 'src/components/ScanQRCodeButton'
import { RootStackParamList } from 'src/modules/navigation'

type Props = {
  nextScreen: RootStackParamList['ScanQRCode']['nextScreen']
  label: string
  setFunction: SetFunction
  openFileCallback: (uri: string) => void
}

function InputContentRow({
  openFileCallback,
  setFunction,
  nextScreen,
  label,
}: Props) {
  return (
    <View style={styles.content}>
      <PasteButton setFunction={setFunction} />
      <ScanQRCodeButton nextScreen={nextScreen} label={label} />
      <OpenFileButton callback={openFileCallback} />
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    marginHorizontal: 32,
  },
})

export default InputContentRow
