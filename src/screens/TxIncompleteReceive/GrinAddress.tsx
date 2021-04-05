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
import SectionTitle from 'src/components/SectionTitle'
import ShareRow from 'src/components/ShareRow'
import { Text, monoSpaceFont } from 'src/components/CustomFont'
import { ActivityIndicator, View } from 'react-native'
import { useSelector } from 'src/common/redux'
import { torStatusSelector, TOR_FAILED, TOR_IN_PROGRESS } from 'src/modules/tor'
import { grinAddressSelector } from 'src/modules/tx/receive'
import { styleSheetFactory, useThemedStyles } from 'src/themes'
import FontAwesome5Icons from 'react-native-vector-icons/FontAwesome5'

function GrinAddress() {
  const [styles] = useThemedStyles(themedStyles)
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
      <SectionTitle title={'Grin Address'} />
      <View style={styles.container}>{address}</View>
      <ShareRow content={grinAddress} label="Grin Address" />
      <View style={styles.warning}>
        <FontAwesome5Icons
          name="exclamation-triangle"
          size={18}
          style={styles.warningIcon}
        />

        <Text style={styles.warningText}>
          Keep the app open to use Grin Address!
        </Text>
      </View>
    </>
  )
}

const themedStyles = styleSheetFactory((theme) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.onBackground,
  },
  loadingText: {
    paddingLeft: 4,
    color: theme.onBackground,
  },
  grinAddress: {
    fontFamily: monoSpaceFont,
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
    textAlign: 'center',
    color: theme.onBackground,
  },
  warning: {
    marginBottom: 8,
    marginTop: 4,
    fontSize: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIcon: {
    color: theme.warningLight,
  },
  warningText: {
    color: theme.warningLight,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 8,
  },
}))

export default GrinAddress
