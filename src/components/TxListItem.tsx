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

import * as React from 'react'
import { TouchableOpacity, View } from 'react-native'
import moment from 'moment'
import { Text } from 'src/components/CustomFont'
import { hrGrin, hrFiat, convertToFiat, formatDate } from 'src/common'
import { Tx, Currency } from 'src/common/types'
import { FlexGrow } from 'src/common'
import {
  slightlyTransparent,
  styleSheetFactory,
  useThemedStyles,
} from 'src/themes'

const themedStyles = styleSheetFactory((theme) => ({
  time: {
    fontSize: 14,
    color: slightlyTransparent(theme.onSurface),
  },
  unconfirmedGuide: {
    fontSize: 14,
    color: theme.secondary,
  },
  amountGrin: {
    fontSize: 21,
    color: theme.onSurface,
  },
  amountFiat: {
    fontSize: 12,
    paddingTop: 4,
    color: theme.onSurface,
  },
  title: {
    fontWeight: '500',
    fontSize: 18,
    color: theme.onSurface,
  },
  wrapper: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginLeft: 16,
    paddingRight: 16,
    marginTop: 12,
    paddingBottom: 12,
  },
}))

type Props = {
  tx: Tx
  currency: Currency
  rates: Record<string, number>
  minimumConfirmations: number
  onPress: () => void
}

const TxListItem = (props: Props) => {
  const [styles] = useThemedStyles(themedStyles)
  const { currency, rates } = props
  const { type, confirmed, creationTime, amount } = props.tx
  const momentCreationTime = moment(creationTime)
  const isFinalized = type === 'TxFinalized'
  const isPosted = type === 'TxPosted'
  const isSent = type.indexOf('Sent') !== -1 || isFinalized || isPosted
  const dateField =
    moment().diff(momentCreationTime, 'hours', true) > 2
      ? formatDate(momentCreationTime)
      : momentCreationTime.fromNow()
  return (
    <TouchableOpacity style={styles.wrapper} onPress={props.onPress}>
      <FlexGrow>
        <View
          style={{
            flexDirection: 'row',
            paddingBottom: 4,
          }}>
          <Text style={styles.title}>
            {confirmed
              ? isSent
                ? 'Sent'
                : 'Received'
              : isSent
                ? 'Sending...'
                : 'Receiving...'}
          </Text>
        </View>
        {confirmed ? (
          <Text style={styles.time}>{dateField}</Text>
        ) : (
          <Text style={styles.unconfirmedGuide}>
            {isPosted
              ? 'Awaiting confirmation...'
              : isFinalized
                ? 'Not sent. Click to retry'
                : isSent
                  ? 'Action required'
                  : 'Sender needs to finish transaction'}
          </Text>
        )}
      </FlexGrow>
      <View
        style={{
          alignItems: 'flex-end',
        }}>
        <Text style={styles.amountGrin}>{hrGrin(amount, 4)}</Text>
        <Text style={styles.amountFiat}>
          {hrFiat(convertToFiat(amount, currency, rates), currency)}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default TxListItem
