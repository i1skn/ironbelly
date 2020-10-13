import * as React from 'react'
import { Text } from 'src/components/CustomFont'
import { hrGrin, hrFiat, convertToFiat } from 'src/common'
import colors from 'src/common/colors'
import { Balance, Navigation, Currency } from 'src/common/types'
import FeatherIcon from 'react-native-vector-icons/Feather'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

type Props = {
  balance: Balance
  currency: Currency
  isOffline: boolean
  navigation: Navigation
  rates: object
}

const BalanceComponent = ({
  balance,
  currency,
  rates,
  isOffline,
  navigation,
}: Props) => {
  return (
    <React.Fragment>
      {isOffline && (
        <Text style={styles.offlineWarningText}>
          Grin node is not reachable
        </Text>
      )}
      <View style={styles.container}>
        <View style={styles.balanceRelated}>
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
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Settings')}>
          <FeatherIcon name="menu" size={32} style={styles.hamburgerIcon} />
        </TouchableOpacity>
      </View>
    </React.Fragment>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  offlineWarningText: {
    fontWeight: '600',
    fontSize: 16,
    color: colors.warning,
    textAlign: 'center',
    paddingVertical: 8,
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hamburgerIcon: {
    color: colors.blueGrey[800],
  },
  balanceRelated: {},
  amountGrin: {
    fontSize: 48,
    color: colors.blueGrey[800],
  },
  nextToBalance: {},
  nextToBalanceRow: {
    fontWeight: '400',
    fontSize: 14,
    color: colors.blueGrey[500],
  },
})

export default BalanceComponent
