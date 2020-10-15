import * as React from 'react'
import HeaderSpan from 'src/components/HeaderSpan'
import LinearGradient from 'react-native-linear-gradient'
import { Text } from 'src/components/CustomFont'
import { hrGrin, hrFiat, convertToFiat } from 'src/common'
import colors from 'src/common/colors'
import { Balance, Navigation, Currency } from 'src/common/types'
import { StyleSheet, View } from 'react-native'

type Props = {
  balance: Balance
  currency: Currency
  navigation: Navigation
  rates: object
}

const BalanceComponent = ({ balance, currency, rates }: Props) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0.75, y: 1 }}
        style={styles.gradient}
        colors={[colors.yellow['400'], colors.yellow['600']]}>
        <HeaderSpan bgColor={'transparent'} />
        <Text style={styles.amountGrin}>
          {hrGrin(balance.total + balance.amountLocked)}
        </Text>
        <View style={styles.nextToBalance}>
          <Text style={styles.nextToBalanceRow}>is your total balance</Text>
          <Text style={styles.nextToBalanceRow}>
            equivalent to{' '}
            {hrFiat(
              convertToFiat(
                balance.total + balance.amountLocked,
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

const styles = StyleSheet.create({
  gradient: {
    paddingHorizontal: 16,
    paddingVertical: 48,
    backgroundColor: colors.primaryLight,
  },
  container: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
    backgroundColor: 'white', // only need to be for elevation to work
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceRelated: {},
  amountGrin: {
    fontSize: 54,
    fontWeight: '300',
    color: colors.onPrimary,
  },
  nextToBalance: {},
  nextToBalanceRow: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.onPrimaryLight,
  },
})

export default BalanceComponent
