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
import { StyleSheet, View, Platform } from 'react-native'
import PasteButton from 'src/components/PasteButton'
import { Text } from 'src/components/CustomFont'

type Props = {
  setFunction: (s: string) => void
  label: string
}

function PasteHeader({ label, setFunction }: Props) {
  return (
    <View style={styles.copyPasteContent}>
      <Text style={styles.copyPasteContentTitle}>{label}</Text>
      <PasteButton setFunction={setFunction} />
    </View>
  )
}

const styles = StyleSheet.create({
  copyPasteContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  copyPasteContentTitle: {
    fontWeight: Platform.select({ android: '700', ios: '500' }),
    fontSize: 16,
  },
})

export default PasteHeader
