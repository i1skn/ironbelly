/**
 * Copyright 2019 Ironbelly Devs
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

import React, { Component, useEffect, useState } from 'react'
import { processColor, StatusBar, StyleSheet, Text, View } from 'react-native'
import { isAndroid, parseSendLink } from 'src/common'
import colors from 'src/common/colors'
import {
  State as GlobalState,
  Navigation,
  NavigationProps,
} from 'src/common/types'
import urlParser from 'url'
import styled from 'styled-components/native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import CardTitle from 'src/components/CardTitle'
import {
  Constants,
  BarCodeScanner,
  PermissionStatus,
} from 'expo-barcode-scanner'
import { Button } from 'src/components/CustomFont'

type Props = NavigationProps<'ScanQRCode'>

function ScanQRCode({ route, navigation }: Props) {
  const { label, nextScreen } = route.params
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)
  useEffect(() => {
    ;(async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === PermissionStatus.GRANTED)
    })()
  }, [])

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true)
    navigation.navigate(nextScreen, { qrContent: data })
  }

  const inner = () => {
    if (hasPermission === null) {
      return <Text style={styles.status}>Requesting for camera permission</Text>
    }
    if (hasPermission === false) {
      return <Text style={styles.status}>No access to camera</Text>
    }
    return (
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.viewFinder}></BarCodeScanner>
    )
  }

  return (
    <>
      <CardTitle title={`Scan ${label}`} navigation={navigation} />
      <View style={styles.container}>{inner()}</View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  viewFinder: {
    ...StyleSheet.absoluteFillObject,
  },
  status: {
    fontSize: 24,
  },
})

export default ScanQRCode
