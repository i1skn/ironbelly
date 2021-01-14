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
import CopyHeader from 'src/components/CopyHeader'
import { View, Platform } from 'react-native'
import { connect } from 'react-redux'
import { formatTime } from 'src/common'
import moment from 'moment'
import { hrGrin } from 'src/common'
import { Link, Text } from 'src/components/CustomFont'
import CardTitle from 'src/components/CardTitle'
import { RootState } from 'src/common/redux'
import { Tx, NavigationProps } from 'src/common/types'
import {
  slightlyTransparent,
  styleSheetFactory,
  useThemedStyles,
} from 'src/themes'

interface OwnProps {
  tx: Tx
}

type Props = NavigationProps<'TxDetails'> & OwnProps

const TxDetails = ({ tx, navigation }: Props) => {
  const [styles, theme] = useThemedStyles(themedStyles)
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
              <Link
                url={`https://grinscan.net/kernel/${tx.kernelExcess}`}
                style={styles.grinScanButtonText}
                title={
                  <>
                    <Text>See on GrinScan </Text>
                    <FeatherIcons
                      name="external-link"
                      size={18}
                      style={{
                        color: theme.link,
                      }}
                    />
                  </>
                }
              />
            </View>
          )}

          <Text style={styles.fieldTitle}>When</Text>
          <Text style={styles.date}>{formatTime(moment(tx.creationTime))}</Text>
        </View>
      )}
    </>
  )
}

const mapStateToProps = (state: RootState, ownProps: Props) => () => {
  return {
    settings: state.settings,
    tx: state.tx.list.data.find((tx) => tx.id === ownProps.route.params.txId),
  }
}

const themedStyles = styleSheetFactory((theme) => ({
  container: {
    padding: 16,
    flex: 1,
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
    color: slightlyTransparent(theme.onBackground),
  },
  fieldValue: {
    color: theme.onBackground,
  },
  amount: {
    fontSize: 32,
    color: theme.onBackground,
  },
  date: {
    color: theme.onBackground,
  },
  field: {
    marginTop: 16,
  },
  grinScanButtonText: {
    textAlign: 'center',
    fontSize: 16,
    paddingTop: 16,
  },
}))

export default connect(mapStateToProps, null)(TxDetails)
