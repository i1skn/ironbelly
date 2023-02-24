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

import BigNumber from 'bignumber.js'
import * as React from 'react'
import HeaderSpan from 'src/components/HeaderSpan'
import LinearGradient from 'react-native-linear-gradient'
import { Text } from 'src/components/CustomFont'
import { hrGrin, hrFiat, convertToFiat } from 'src/common'
import { Balance, Currency } from 'src/common/types'
import { View } from 'react-native'
import {
  slightlyTransparent,
  useThemedStyles,
  styleSheetFactory,
} from 'src/themes'

type Props = {
  balance: Balance;
  currency: Currency;
  rates: Record<string, number>;
};

const BalanceComponent = ({ balance, currency, rates }: Props) => {
  const [styles, theme] = useThemedStyles(themedStyles)
  return (
    <View style={styles.container}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0.75, y: 1 }}
        style={styles.gradient}
        colors={[theme.heroGradientStart, theme.heroGradientEnd]}>
        <HeaderSpan bgColor={'transparent'} />
        <Text style={styles.amountGrin}>
          {hrGrin(new BigNumber(balance.total).plus(balance.amountLocked), 4)}
        </Text>
        <View style={styles.nextToBalance}>
          <Text style={styles.nextToBalanceRow}>is your total balance</Text>
          <Text style={styles.nextToBalanceRow}>
            equivalent to{' '}
            {hrFiat(
              convertToFiat(
                new BigNumber(balance.total).plus(balance.amountLocked),
                currency,
                rates,
              ),
              currency,
            )}
          </Text>
        </View>
      </LinearGradient>
    </View>
  )
}

const themedStyles = styleSheetFactory(theme => ({
  gradient: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    paddingTop: 80,
  },
  container: {
    shadowColor: theme.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
    zIndex: 1,
    position: 'relative',
    backgroundColor: theme.background, // only need to be for elevation to work
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceRelated: {},
  amountGrin: {
    fontSize: 40,
    fontWeight: '300',
    color: theme.onHero,
  },
  nextToBalance: {},
  nextToBalanceRow: {
    fontSize: 16,
    fontWeight: '400',
    color: slightlyTransparent(theme.onHero),
  },
}))

export default BalanceComponent
