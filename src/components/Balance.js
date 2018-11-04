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
import { hrGrin, colors } from 'common'
import { type Balance, type Navigation } from 'common/types'
import SettingsImg from 'assets/images/Settings.png'

const BalanceTitle = styled(Text)`
  font-weight: 600;
  font-size: 21;
  text-align: center;
`

const Amount = styled.View`
  align-items: center;
`

const AmountGrin = styled(Text)`
  font-weight: ${({ bold }) => (bold ? 600 : 300)};
  font-size: 20;
  line-height: 24;
`
const AmountTitle = styled(Text)`
  font-weight: ${({ bold }) => (bold ? 600 : 400)};
  font-size: 14;
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
  padding: 2px 8px;
  color: #fff;
  text-align: center;
`

const Wrapper = styled.View`
  justify-content: space-between;
  padding: 28px 16px 0 16px;
  background-color: ${() => colors.primary};
`

const HelpIcon = styled.TouchableOpacity`
  width: 24;
  height: 24;
`

const SettingsIcon = styled.TouchableOpacity`
  width: 24;
  height: 24;
`

const SettingsIconImage = styled.Image`
  width: 24;
  height: 24;
`

const TopLine = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const BalanceEq = styled.View`
  margin-top: 8;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

type Props = {
  balance: Balance,
  currency: string,
  isOffline: boolean,
  navigation: Navigation,
}

const BalanceComponent = ({ balance, currency, isOffline, navigation }: Props) => {
  return (
    <React.Fragment>
      <Wrapper>
        <TopLine>
          <HelpIcon />
          <BalanceTitle>Balance</BalanceTitle>
          <SettingsIcon onPress={() => navigation.navigate('Settings')}>
            <SettingsIconImage source={SettingsImg} />
          </SettingsIcon>
        </TopLine>
        <BalanceEq>
          <Amount>
            <AmountTitle bold={!balance.amountLocked}>Total</AmountTitle>
            <AmountGrin bold={!balance.amountLocked}>{hrGrin(balance.total)}</AmountGrin>
          </Amount>
          <Amount>
            <AmountTitle bold={!!balance.amountLocked}>Spendable</AmountTitle>
            <AmountGrin bold={!!balance.amountLocked}>
              {hrGrin(balance.amountCurrentlySpendable)}
            </AmountGrin>
          </Amount>
          <Amount>
            <AmountTitle>Locked</AmountTitle>
            <AmountGrin>{hrGrin(balance.amountLocked)}</AmountGrin>
          </Amount>
        </BalanceEq>
        <View style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {/*<BalanceFiat>{hrFiat(totalFiat, currency)}</BalanceFiat>*/}
        </View>
      </Wrapper>
      {isOffline && <OfflineText>you're offline</OfflineText>}
    </React.Fragment>
  )
}

export default BalanceComponent
