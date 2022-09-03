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
import BigNumber from 'bignumber.js'
import { View } from 'react-native'
import { Text } from 'src/components/CustomFont'
import CardTitle from 'src/components/CardTitle'
import { Tx } from 'src/common/types'
import { NavigationProps } from 'src/common/types'
import SlateCreated from 'src/screens/TxIncompleteSend/SlateCreated'
import SlateNotCreated from 'src/screens/TxIncompleteSend/SlateNotCreated'
import { hrGrin } from 'src/common'
import { styleSheetFactory, useThemedStyles } from 'src/themes'

interface OwnProps {
  tx: Tx
}

type Props = NavigationProps<'TxIncompleteSend'> & OwnProps

const TxIncompleteSend = ({ navigation, route }: Props) => {
  console.log(route)
  const [styles] = useThemedStyles(themedStyles)
  const tx = route?.params?.tx
  const title = tx
    ? `Sending ${hrGrin(new BigNumber(tx.amount).abs())}`
    : `Send`
  const subTitle = tx && `fee: ${hrGrin(tx.fee)}`

  useEffect(() => {
    navigation.setParams({ title, subTitle })
  }, [title, subTitle])

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
          <SlateCreated tx={tx} route={route} navigation={navigation} />
        ) : (
          <SlateNotCreated route={route} navigation={navigation} />
        )}
      </View>
    </>
  )
}

export function androidHeaderTitle(
  params: NavigationProps<'TxIncompleteSend'>['route']['params'],
) {
  const [styles] = useThemedStyles(themedStyles)
  return (
    <View>
      <Text style={styles.androidHeaderTitle}>{params?.title}</Text>
      {params?.subTitle && (
        <Text style={styles.androidHeaderSubTitle}>{params?.subTitle}</Text>
      )}
    </View>
  )
}

const themedStyles = styleSheetFactory(theme => ({
  androidHeaderTitle: {
    fontSize: 21,
    color: theme.onBackground,
  },
  androidHeaderSubTitle: {
    color: theme.onBackground,
    fontSize: 12,
  },
  container: {
    flexGrow: 1,
  },
}))

export default TxIncompleteSend
