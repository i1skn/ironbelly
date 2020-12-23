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

import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import colors from 'src/common/colors'
import { NavigationProps } from 'src/common/types'
import CardTitle from 'src/components/CardTitle'
import { BarCodeScanner, PermissionStatus } from 'expo-barcode-scanner'

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
      return <ActivityIndicator size="large" color={colors.grey[700]} />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewFinder: {
    ...StyleSheet.absoluteFillObject,
  },
  status: {
    fontSize: 24,
    textAlign: 'center',
  },
})

export default ScanQRCode
