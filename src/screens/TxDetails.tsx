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
import React from 'react'
import FeatherIcons from 'react-native-vector-icons/Feather'
import colors from 'src/common/colors'
import CopyHeader from 'src/components/CopyHeader'
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
  Linking,
} from 'react-native'
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
  const seeKernelOnGrinScan = (kernelExcess: string) => () =>
    Linking.openURL(`https://grinscan.net/kernel/${kernelExcess}`)

  return (
    <>
      <CardTitle title="Transaction Details" navigation={navigation} />
      {tx && (
        <View style={styles.container}>
          <Text style={styles.fieldTitle}>Amount</Text>
          <Text style={styles.amount}>{hrGrin(tx.amount)}</Text>

          {!new BigNumber(tx.fee).isZero() && (
            <>
              <Text style={styles.fieldTitle}>Fee</Text>
              <Text>{hrGrin(tx.fee)}</Text>
            </>
          )}
          {tx.slateId && (
            <View style={styles.field}>
              <CopyHeader content={tx.slateId} label={'Transaction ID'} />
              <Text style={styles.fieldValue}>{tx.slateId}</Text>
            </View>
          )}
          {tx.kernelExcess && (
            <View style={styles.field}>
              <CopyHeader content={tx.kernelExcess} label={'Kernel Excess'} />
              <Text style={styles.fieldValue}>{tx.kernelExcess}</Text>
              <TouchableOpacity
                style={styles.grinScanButton}
                onPress={seeKernelOnGrinScan(tx.kernelExcess)}>
                <Text style={styles.grinScanButtonText}>
                  See on GrinScan{' '}
                  <FeatherIcons
                    name="external-link"
                    size={18}
                    style={{
                      color: colors.link,
                    }}
                  />
                </Text>
              </TouchableOpacity>
            </View>
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
    marginTop: 16,
    marginBottom: 8,
  },
  fieldValue: {
    color: colors.grey[700],
  },
  amount: {
    fontSize: 32,
  },
  date: {
    color: colors.grey[700],
  },
  field: {
    marginTop: 16,
  },
  grinScanButton: {},
  grinScanButtonText: {
    textAlign: 'center',
    fontSize: 16,
    paddingTop: 16,
    color: colors.link,
  },
})

export default connect(mapStateToProps, null)(TxDetails)
