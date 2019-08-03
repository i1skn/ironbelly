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
import { Text } from 'components/CustomFont'
import styled from 'styled-components/native'
import { isAndroid, hrGrin, hrFiat, convertToFiat } from 'common'
import colors from 'common/colors'
import { type Balance, type Navigation, type Currency } from 'common/types'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
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

const AmountTotal = styled.View`
  align-items: flex-end;
  justify-content: flex-end;
`

const AmountGrin = styled(Text)`
  font-weight: ${({ bold }) => (bold ? 600 : 300)};
  font-size: 20;
  line-height: 24;
`

const AmountGrinTotal = styled(Text)`
  font-weight: ${({ bold }) => (bold ? 600 : 300)};
  font-size: 24;
`

const AmountFiatTotal = styled(Text)`
  font-weight: 400;
  font-size: 16;
  color: ${() => colors.grey[900]};
`

const AmountTitle = styled(Text)`
  font-weight: ${({ bold }) => (bold ? 600 : 400)};
  font-size: 16;
`

const AmountTitleTotal = styled(Text)`
  font-weight: ${({ bold }) => (bold ? 600 : 400)};
  font-size: 20;
`

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
  padding: ${isAndroid ? '8px' : '28px'} 16px 0 16px;
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
  width: 30;
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
  currency: Currency,
  isOffline: boolean,
  navigation: Navigation,
  isFloonet: boolean,
  minimumConfirmations: number,
  rates: Object,
}

const BalanceComponent = ({
  minimumConfirmations,
  isFloonet,
  balance,
  currency,
  rates,
  isOffline,
  navigation,
}: Props) => {
  return (
    <React.Fragment>
      <Wrapper>
        <TopLine>
          {!isAndroid && (
            <TopIcon onPress={() => navigation.navigate('ScanQRCode')}>
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={26}
                style={{ color: colors.black }}
              />
            </TopIcon>
          )}
          <BalanceTitle>Balance</BalanceTitle>

          <TopIcon onPress={() => navigation.navigate('Settings')}>
            <FontAwesomeIcon name="cogs" size={28} style={{ color: colors.black }} />
          </TopIcon>
        </TopLine>
        <BalanceEq>
          <Amount>
            <AmountTitle>Awaiting {minimumConfirmations} confirmations</AmountTitle>
            <AmountGrin>{hrGrin(balance.amountAwaitingConfirmation)}</AmountGrin>
          </Amount>
          <Amount>
            <AmountTitle>Currently spendable</AmountTitle>
            <AmountGrin>{hrGrin(balance.amountCurrentlySpendable)}</AmountGrin>
          </Amount>
          <Amount>
            <AmountTitle>Locked</AmountTitle>
            <AmountGrin>{hrGrin(balance.amountLocked)}</AmountGrin>
          </Amount>
          <Amount>
            <AmountTitleTotal bold={true}>Total</AmountTitleTotal>
            <AmountTotal>
              <AmountGrinTotal bold={true}>
                {hrGrin(balance.total + balance.amountLocked)}
              </AmountGrinTotal>
              <AmountFiatTotal>
                {hrFiat(
                  convertToFiat(balance.total + balance.amountLocked, currency, rates),
                  currency
                )}
              </AmountFiatTotal>
            </AmountTotal>
          </Amount>
        </BalanceEq>
      </Wrapper>
      {isFloonet && <Floonet>You are using Testnet</Floonet>}

      {isOffline && <OfflineText>Grin node is not reachable</OfflineText>}
    </React.Fragment>
  )
}

export default BalanceComponent
