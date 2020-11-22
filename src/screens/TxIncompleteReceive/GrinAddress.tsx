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
import CopyHeader from 'src/components/CopyHeader'
import { Text, monoSpaceFont } from 'src/components/CustomFont'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useSelector } from 'src/common/redux'
import { torStatusSelector, TOR_FAILED, TOR_IN_PROGRESS } from 'src/modules/tor'
import colors from 'src/common/colors'
import { grinAddressSelector } from 'src/modules/tx/receive'

function GrinAddress() {
  const grinAddress = useSelector(grinAddressSelector)
  const torStatus = useSelector(torStatusSelector)

  let address

  if (torStatus === TOR_IN_PROGRESS) {
    address = (
      <>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading</Text>
      </>
    )
  } else if (torStatus === TOR_FAILED) {
    address = <Text>Can not use Grin Address</Text>
  } else {
    // TOR is connected
    address = <Text style={styles.grinAddress}>{grinAddress}</Text>
  }

  return (
    <>
      <CopyHeader content={grinAddress} label={'Grin Address'} />
      <View style={styles.container}>{address}</View>
      <Text style={styles.warning}>Keep the app open to use Grin Address!</Text>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    paddingLeft: 4,
  },
  grinAddress: {
    fontFamily: monoSpaceFont,
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  warning: {
    color: colors.warning,
    marginBottom: 8,
    fontSize: 17,
    textAlign: 'center',
  },
})

export default GrinAddress
