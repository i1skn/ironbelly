// @flow
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

import { Text } from 'components/CustomFont'
import styled from 'styled-components/native'
import { hrGrin } from 'common'
import { type Tx, type Currency } from 'common/types'
import ShareImg from 'assets/images/Share.png'
import ChevronRightImg from 'assets/images/ChevronRight.png'
import colors from 'common/colors'

const Time = styled(Text)`
  font-size: 14;
  color: ${() => colors.grey[700]};
`
const UnconfirmedGuide = styled(Text)`
  font-size: 14;
  color: ${() => colors.warning};
`

const AmountGrin = styled(Text)`
  font-weight: 600;
  font-size: 20;
  color: ${props => (props.isSent && colors.black) || colors.success};
`

const Fee = styled(Text)`
  font-weight: 500;
  font-size: 12;
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
const ShareIcon = styled.Image`
  width: 19;
  height: 22;
`

const DetailsChevron = styled.Image`
  width: 20;
  height: 20;
  margin-right: -4;
  margin-left: 8;
`

type Props = {
  tx: Tx,
  currency: Currency,
  minimumConfirmations: number,
}
const TxListItem = (props: Props) => {
  const { type, confirmed, creationTime, amount, fee } = props.tx
  const isSent = type.indexOf('Sent') !== -1 || type === 'TxFinalized' || type === 'TxPosted'
  return (
    <Wrapper>
      <View style={{ flexGrow: 1 }}>
        <View style={{ flexDirection: 'row' }}>
          <AmountGrin isSent={isSent}>{hrGrin(amount - fee)}</AmountGrin>
          {!!fee && <Fee> (incl. {hrGrin(fee)} fee)</Fee>}
        </View>
        {confirmed ? (
          <Time>{creationTime.fromNow()}</Time>
        ) : (
          <UnconfirmedGuide>
            {type === 'TxPosted'
              ? `Awaiting confirmation`
              : type === 'TxFinalized'
              ? 'Click to confirm'
              : isSent
              ? 'Share with a recipient'
              : 'Share with the sender'}
          </UnconfirmedGuide>
        )}
      </View>
      {/*<View style={{ alignItems: 'flex-start' }}>
        <AmountFiat>{hrFiat(convertToFiat(amount, currency), currency)}</AmountFiat>
      </View>*/}

      {(!confirmed && type !== 'TxPosted' && <ShareIcon source={ShareImg} />) || (
        <DetailsChevron source={ChevronRightImg} />
      )}
    </Wrapper>
  )
}

export default TxListItem
