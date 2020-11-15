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

import React, { useEffect, useMemo, useState } from 'react'
import CopyHeader from 'src/components/CopyHeader'
import { Text, monoSpaceFont } from 'src/components/CustomFont'
import {
  ActivityIndicator,
  StyleSheet,
  View,
  NativeModules,
} from 'react-native'
import { store, useSelector } from 'src/common/redux'
import {
  torStatusSelector,
  TOR_DISCONNECTED,
  TOR_FAILED,
  TOR_IN_PROGRESS,
} from 'src/modules/tor'
import { getStateForRust } from 'src/common'
import colors from 'src/common/colors'
import { txListSelector } from 'src/modules/tx'
import { getNavigation } from 'src/modules/navigation'
import { useDispatch } from 'react-redux'
import { RustTx } from 'src/common/types'

const { GrinBridge } = NativeModules

const REFRESH_INTERVAL = 5000

function GrinAddress() {
  const dispatch = useDispatch()
  let [grinAddress, setGrinAddress] = useState('')

  const rustState = useMemo(() => getStateForRust(store.getState()), [
    getStateForRust,
    store,
  ])

  // HTTP Listening
  useEffect(() => {
    GrinBridge.startListenWithHttp(rustState)
      .then(setGrinAddress)
      // .then(() => {})
      .catch(console.error)

    return () => {
      GrinBridge.stopListenWithHttp()
    }
  }, [rustState])

  const txList = useSelector(txListSelector)
  useEffect(() => {
    const interval = setInterval(async () => {
      const txs = await GrinBridge.txsGet(rustState, false).then(JSON.parse)
      if (
        txs[1].filter((tx: RustTx) => tx.tx_type.indexOf('Cancelled') === -1)
          .length !== txList.length
      ) {
        const navigation = await getNavigation()
        navigation.navigate('Overview')
        dispatch({
          type: 'TX_LIST_REQUEST',
          showLoader: false,
          refreshFromNode: false,
        })
        dispatch({
          type: 'TOAST_SHOW',
          text: 'Transaction has been received',
        })
      }
    }, REFRESH_INTERVAL)
    return () => {
      clearInterval(interval)
    }
  }, [rustState])

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
      <Text style={styles.warning}>
        Do not close this window to receive via Grin Address!
      </Text>
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
    // textAlign: 'center',
  },
})

export default GrinAddress
