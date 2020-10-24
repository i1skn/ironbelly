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

import React, { useCallback } from 'react'
import colors from 'src/common/colors'
import { TouchableOpacity, StyleSheet, View, Platform } from 'react-native'
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

type Props = NavigationProps<'TxDetails'> & OwnProps

const TxDetails = ({ tx, navigation }: Props) => {
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
    fontWeight: Platform.select({ android: '700', ios: '500' }),
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
