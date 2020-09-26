import React, { useCallback } from 'react'
import colors from 'src/common/colors'
import { TouchableOpacity, StyleSheet, View } from 'react-native'
import { connect, useDispatch } from 'react-redux'
import { formatTime } from 'src/common'
import moment from 'moment'
import { hrGrin } from 'src/common'
import { Text } from 'src/components/CustomFont'
import CardTitle from 'src/components/CardTitle'
import { State as ReduxState, Tx } from 'src/common/types'
import { NavigationProps } from 'src/common/types'
import Clipboard from '@react-native-community/clipboard'

interface OwnProps {
  tx: Tx
}

type Props = NavigationProps<'TxIncomplete'> & OwnProps

const TxIncomplete = ({ tx, navigation }: Props) => {
  const dispatch = useDispatch()
  const copyToClipboard = useCallback(
    (s: string) => {
      return () => {
        Clipboard.setString(s)
        dispatch({
          type: 'TOAST_SHOW',
          text: 'Copied to Clipboard',
        })
      }
    },
    [dispatch],
  )
  return (
    <>
      <CardTitle title="Incomplete Transaction" navigation={navigation} />
      {tx && (
        <View style={styles.container}>
          <View style={styles.amountGroup}>
            <Text style={styles.amount}>{hrGrin(tx.amount)}</Text>

            <Text style={styles.fee}>
              {!!tx.fee && `fee: ${hrGrin(tx.fee)}`}
            </Text>
          </View>
          <>
            <Text style={styles.fieldTitle}>Transaction ID</Text>
            {tx.slateId ? (
              <TouchableOpacity onPress={copyToClipboard(tx.slateId)}>
                <Text style={styles.id}>{tx.slateId}</Text>
              </TouchableOpacity>
            ) : (
              <Text>Not Available</Text>
            )}
          </>
        </View>
      )}
    </>
  )
}

const mapStateToProps = (state: ReduxState, ownProps: Props) => () => {
  return {
    settings: state.settings,
    tx: state.tx.list.data.find((tx) => tx.id === ownProps.route.params.txId),
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
  amountGroup: {
    marginBottom: 16,
  },
  amount: {
    fontSize: 32,
    textAlign: 'center',
  },
  fee: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
    color: colors.grey[700],
  },
  date: {
    color: colors.grey[700],
  },
  id: {
    color: colors.grey[700],
  },
})

export default connect(mapStateToProps, null)(TxIncomplete)
