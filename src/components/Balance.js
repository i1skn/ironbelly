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
import colors from 'common/colors'
import { type Balance, type Navigation } from 'common/types'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'

const BalanceTitle = styled(Text)`
  font-weight: 600;
  font-size: 21;
  text-align: center;
  flex-direction: row;
`

const Amount = styled.View`
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
`

const AmountGrin = styled(Text)`
  font-weight: ${({ bold }) => (bold ? 600 : 300)};
  font-size: 20;
  line-height: 24;
`
const AmountTitle = styled(Text)`
  font-weight: ${({ bold }) => (bold ? 600 : 400)};
  font-size: 16;
`

// const BalanceFiat = styled(Text)`
// font-weight: 600;
// font-size: 16;
// bottom: 12;
// `

const OfflineText = styled(Text)`
  font-weight: 600;
  font-size: 16;
  background: ${() => colors.warning};
  padding: 6px 8px;
  color: #fff;
  text-align: center;
`

const Wrapper = styled.View`
  justify-content: space-between;
  padding: 28px 16px 0 16px;
  background-color: ${() => colors.primary};
`

const Floonet = styled(Text)`
  font-weight: 600;
  font-size: 16;
  background: ${() => colors.orange[800]};
  padding: 6px 8px;
  color: #fff;
  text-align: center;
`

const TopIcon = styled.TouchableOpacity`
  width: 28;
  height: 28;
`

const TopLine = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const BalanceEq = styled.View`
  margin: 16px 0 8px 0;
`

type Props = {
  balance: Balance,
  currency: string,
  isOffline: boolean,
  navigation: Navigation,
  isFloonet: boolean,
  minimumConfirmations: number,
}

const BalanceComponent = ({
  minimumConfirmations,
  isFloonet,
  balance,
  currency,
  isOffline,
  navigation,
}: Props) => {
  return (
    <React.Fragment>
      <Wrapper>
        <TopLine>
          <TopIcon onPress={() => navigation.navigate('ScanQRCode')}>
            <AntDesignIcon name="qrcode" size={28} />
          </TopIcon>
          <BalanceTitle>Balance</BalanceTitle>

          <TopIcon onPress={() => navigation.navigate('Settings')}>
            <FontAwesomeIcon name="cog" size={28} />
          </TopIcon>
        </TopLine>
        <BalanceEq>
          <Amount>
            <AmountTitle bold={!!balance.total}>Total</AmountTitle>
            <AmountGrin bold={!!balance.total}>{hrGrin(balance.total)}</AmountGrin>
          </Amount>
          <Amount>
            <AmountTitle bold={!!balance.amountAwaitingConfirmation}>
              Awaiting {minimumConfirmations} confirmations
            </AmountTitle>
            <AmountGrin bold={!!balance.amountAwaitingConfirmation}>
              {hrGrin(balance.amountAwaitingConfirmation)}
            </AmountGrin>
          </Amount>
          <Amount>
            <AmountTitle bold={!!balance.amountCurrentlySpendable}>Currently spendable</AmountTitle>
            <AmountGrin bold={!!balance.amountCurrentlySpendable}>
              {hrGrin(balance.amountCurrentlySpendable)}
            </AmountGrin>
          </Amount>
          <Amount>
            <AmountTitle bold={!!balance.amountLocked}>Locked</AmountTitle>
            <AmountGrin bold={!!balance.amountLocked}>{hrGrin(balance.amountLocked)}</AmountGrin>
          </Amount>
        </BalanceEq>
        <View style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {/*<BalanceFiat>{hrFiat(totalFiat, currency)}</BalanceFiat>*/}
        </View>
      </Wrapper>
      {isFloonet && <Floonet>You are using Testnet</Floonet>}

      {isOffline && <OfflineText>Grin node is not reachable</OfflineText>}
    </React.Fragment>
  )
}

export default BalanceComponent
