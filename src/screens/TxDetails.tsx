import React from 'react'
import colors from 'src/common/colors'
import { StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { formatTime } from 'src/common'
import moment from 'moment'
import { hrGrin } from 'src/common'
import { Text } from 'src/components/CustomFont'
import CardTitle from 'src/components/CardTitle'
import { State as ReduxState, Tx } from 'src/common/types'
import { NavigationProps } from 'src/common/types'

interface OwnProps {
  tx: Tx
}

type Props = NavigationProps<'TxDetails'> & OwnProps

const TxDetails = ({ tx, navigation }: Props) => {
  return (
    <>
      <CardTitle title="Transaction Details" navigation={navigation} />
      {tx && (
        <View style={styles.container}>
          <Text style={styles.fieldTitle}>Amount</Text>
          <Text style={styles.amount}>{hrGrin(tx.amount)}</Text>

          {!!tx.fee && (
            <>
              <Text style={styles.fieldTitle}>Fee</Text>
              <Text>{hrGrin(tx.fee)}</Text>
            </>
          )}
          {!!tx.slateId && (
            <>
              <Text style={styles.fieldTitle}>ID</Text>
              <Text style={styles.id}>{tx.slateId}</Text>
            </>
          )}

          <Text style={styles.fieldTitle}>When</Text>
          <Text style={styles.date}>{formatTime(moment(tx.creationTime))}</Text>
        </View>
      )}
    </>
  )
}

const mapStateToProps = (state: ReduxState, ownProps: Props) => () => {
  return {
    settings: state.settings,
    tx: state.tx.list.data.find(tx => tx.id === ownProps.route.params.txId),
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  cardTitle: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
  },
  fieldTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  amount: {
    fontSize: 32,
  },
  date: {
    color: colors.grey[700],
  },
  id: {
    color: colors.grey[700],
  },
})

export default connect(mapStateToProps, null)(TxDetails)
