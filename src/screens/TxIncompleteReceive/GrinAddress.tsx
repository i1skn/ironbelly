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

import React, { useEffect, useRef, useState } from 'react'
import SectionTitle from 'src/components/SectionTitle'
import ShareRow from 'src/components/ShareRow'
import { Text, monoSpaceFont } from 'src/components/CustomFont'
import { ActivityIndicator, View } from 'react-native'
import { useSelector } from 'src/common/redux'
import { torStatusSelector, TOR_FAILED, TOR_IN_PROGRESS } from 'src/modules/tor'
import { grinAddressSelector } from 'src/modules/tx/receive'
import { styleSheetFactory, useThemedStyles } from 'src/themes'
import CheckBox from 'react-native-check-box'
import KeepAwake from 'react-native-keep-awake'

function GrinAddress() {
  const [styles, theme] = useThemedStyles(themedStyles)
  const grinAddress = useSelector(grinAddressSelector)
  const torStatus = useSelector(torStatusSelector)
  const [keepAwake, setKeepAwake] = useState(false)
  const txList = useSelector(state => state.tx.list.data)
  const initialLastTx = useRef(txList.length ? txList[0] : undefined)

  useEffect(() => {
    if (
      (!initialLastTx.current || txList[0].id !== initialLastTx.current.id) &&
      txList.length &&
      !txList[0].confirmed
    ) {
      setKeepAwake(false)
    }
  }, [txList])

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
      <Text style={styles.warningText}>
        Ironbelly MUST be in the foreground and the phone must not be in sleep
        mode to be able to use Grin Address!
      </Text>
      <CheckBox
        checkBoxColor={theme.secondary}
        onClick={() => setKeepAwake(!keepAwake)}
        isChecked={keepAwake}
        rightTextView={
          <View>
            <Text style={styles.leaveAppWaitingText}>
              Keep the app opened until any transaction is received (will
              significantly drain battery)
            </Text>
          </View>
        }
      />
      {keepAwake && <KeepAwake />}
    </>
  )
}

const themedStyles = styleSheetFactory(theme => ({
  leaveAppWaitingText: {
    marginLeft: 16,
    marginRight: 24,
    color: theme.onBackground,
  },
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
  warningText: {
    color: theme.warningLight,
    fontWeight: 'bold',
    marginBottom: 16,
  },
}))

export default GrinAddress
