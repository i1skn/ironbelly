//
// Copyright 2019 Ivan Sorokin.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
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
  color: ${() => colors.grey[700]};
`
const UnconfirmedGuide = styled(Text)`
  font-size: 14;
  color: ${() => colors.warning};
`
const AmountGrin = styled(Text)<{ isSent: boolean }>`
  font-weight: 600;
  font-size: 18;
  color: ${(props) => (props.isSent && colors.black) || colors.success};
`
const AmountFiat = styled(Text)`
  font-size: 14;
  color: ${() => colors.grey[700]};
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
  rates: object
  minimumConfirmations: number
}

const TxListItem = (props: Props) => {
  const { currency, rates } = props
  const { type, confirmed, creationTime, amount } = props.tx
  const momentCreationTime = moment(creationTime)
  const isSent =
    type.indexOf('Sent') !== -1 || type === 'TxFinalized' || type === 'TxPosted'
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
          }}>
          <Title>{isSent ? 'Outgoing' : 'Incoming'}</Title>
        </View>
        {confirmed ? (
          <Time>{dateField}</Time>
        ) : (
          <UnconfirmedGuide>
            {type === 'TxPosted'
              ? 'Awaiting confirmation...'
              : type === 'TxFinalized'
              ? 'Click to confirm'
              : 'Incomplete: Step 1 of 3'}
          </UnconfirmedGuide>
        )}
      </FlexGrow>
      <View
        style={{
          alignItems: 'flex-end',
        }}>
        <AmountGrin isSent={isSent}>{hrGrin(amount)}</AmountGrin>
        <AmountFiat>
          {hrFiat(convertToFiat(amount, currency, rates), currency)}
        </AmountFiat>
      </View>
    </Wrapper>
  )
}

export default TxListItem
