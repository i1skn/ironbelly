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

import React, { useEffect } from 'react'

import colors from 'src/common/colors'
import { StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { Text } from 'src/components/CustomFont'
import CardTitle from 'src/components/CardTitle'
import { Tx } from 'src/common/types'
import { NavigationProps } from 'src/common/types'
import SlateCreated from 'src/screens/TxIncompleteSend/SlateCreated'
import SlateNotCreated from 'src/screens/TxIncompleteSend/SlateNotCreated'
import { hrGrin } from 'src/common'

interface OwnProps {
  tx: Tx
}

type Props = NavigationProps<'TxIncompleteSend'> & OwnProps

const TxIncompleteSend = ({ navigation, route }: Props) => {
  const tx = route?.params?.tx
  const title = tx ? `Sending ${hrGrin(Math.abs(tx.amount))}` : `Send`
  const subTitle = tx && `fee: ${hrGrin(tx.fee)}`
  const dispatch = useDispatch()

  const resetTxForm = () => {
    dispatch({
      type: 'TX_FORM_RESET',
    })
  }

  useEffect(() => {
    navigation.setParams({ title, subTitle })
  }, [title, subTitle])

  useEffect(() => {
    return navigation.addListener('blur', () => {
      resetTxForm()
    })
  }, [navigation])

  return (
    <>
      <CardTitle
        style={{}}
        title={title}
        subTitle={subTitle}
        navigation={navigation}
      />
      <View style={styles.container}>
        {tx?.slateId ? (
          <SlateCreated
            slateId={tx.slateId}
            route={route}
            navigation={navigation}
          />
        ) : (
          <SlateNotCreated />
        )}
      </View>
    </>
  )
}

export function androidHeaderTitle(
  params: NavigationProps<'TxIncompleteSend'>['route']['params'],
) {
  if (!params?.subTitle) {
    return params?.title
  }
  return (
    <View>
      <Text style={styles.androidHeaderTitle}>{params?.title}</Text>
      <Text style={styles.androidHeaderSubTitle}>{params?.subTitle}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  androidHeaderTitle: {
    fontSize: 21,
  },
  androidHeaderSubTitle: {
    color: colors.grey[700],
    fontSize: 12,
  },
  container: {
    flexGrow: 1,
  },
})

export default TxIncompleteSend
