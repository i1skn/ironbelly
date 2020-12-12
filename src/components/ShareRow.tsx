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
import CopyButton from 'src/components/CopyButton'
import ShareButton from 'src/components/ShareButton'
import ShowQRCodeButton from 'src/components/ShowQRCodeButton'

type Props = {
  content?: string
  label: string
  onShareFile?: () => void
}

function ShareRow({ content, label, onShareFile }: Props) {
  if (!content) {
    return null
  }
  return (
    <View style={styles.content}>
      <CopyButton content={content} subject={label} />
      <ShowQRCodeButton content={content} label={label} />
      {onShareFile && <ShareButton onClick={onShareFile} />}
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
})

export default ShareRow
