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
import { View } from 'react-native'
import moment from 'moment'
import { Text } from 'src/components/CustomFont'
import styled from 'styled-components/native'
import { hrGrin, hrFiat, convertToFiat, formatDate } from 'src/common'
import { Tx, Currency } from 'src/common/types'
import colors from 'src/common/colors'
import { FlexGrow } from 'src/common'
const Time = styled(Text)`
  font-size: 14;
  color: ${() => colors.onSurfaceLight};
`
const UnconfirmedGuide = styled(Text)`
  font-size: 14;
  color: ${() => colors.secondary};
`
const AmountGrin = styled(Text)`
  font-size: 21;
  color: ${() => colors.onSurface};
`
const AmountFiat = styled(Text)`
  font-size: 12;
  padding-top: 4px;
  color: ${() => colors.onSurface};
`
const Title = styled(Text)`
  font-weight: 500;
  font-size: 18;
  color: #000;
`
const Wrapper = styled.View`
  flex-direction: row;
  flex-grow: 1;
  justify-content: flex-start;
  align-items: center;
  margin-left: 16;
  padding-right: 16;
  margin-top: 12;
  padding-bottom: 12;
`
type Props = {
  tx: Tx
  currency: Currency
  rates: Record<string, number>
  minimumConfirmations: number
}

const TxListItem = (props: Props) => {
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
    <Wrapper>
      <FlexGrow>
        <View
          style={{
            flexDirection: 'row',
            paddingBottom: 4,
          }}>
          <Title>
            {confirmed
              ? isSent
                ? 'Sent'
                : 'Received'
              : isSent
              ? 'Sending...'
              : 'Receiving...'}
          </Title>
        </View>
        {confirmed ? (
          <Time>{dateField}</Time>
        ) : (
          <UnconfirmedGuide>
            {isPosted
              ? 'Awaiting confirmation...'
              : isFinalized
              ? 'Not sent. Click to retry'
              : isSent
              ? 'Action required'
              : 'Sender needs to finish transaction'}
          </UnconfirmedGuide>
        )}
      </FlexGrow>
      <View
        style={{
          alignItems: 'flex-end',
        }}>
        <AmountGrin>{hrGrin(amount)}</AmountGrin>
        <AmountFiat>
          {hrFiat(convertToFiat(amount, currency, rates), currency)}
        </AmountFiat>
      </View>
    </Wrapper>
  )
}

export default TxListItem
