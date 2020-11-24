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

import React, { Component } from 'react'
import {
  Alert,
  TouchableHighlight,
  TouchableOpacity,
  RefreshControl,
  View,
  StyleSheet,
} from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import { Text } from 'src/components/CustomFont'
import Balance from 'src/components/Balance'
import TxListItem from 'src/components/TxListItem'
import { isIphoneX } from 'react-native-iphone-x-helper'
import { BIOMETRY_STATUS } from 'src/modules/settings'
import { State as CurrencyRatesState } from 'src/modules/currency-rates'
import {
  Balance as BalanceType,
  State as GlobalState,
  Tx,
} from 'src/common/types'
import colors from 'src/common/colors'
import { getBiometryTitle } from 'src/common'
import { WalletInitState } from 'src/modules/wallet'
import { State as SettingsState } from 'src/modules/settings'
import { NavigationProps } from 'src/common/types'

interface OwnProps {
  balance: BalanceType
  txs: Array<Tx>
  settings: SettingsState
  txCancel: (id: number, slateId: string, isResponse: boolean) => void
  txsGet: (showLoader: boolean, refreshFromNode: boolean) => void
  enableBiometry: () => void
  disableBiometry: () => void
  txConfirm: (txSlateId: string) => void
  txListRefreshInProgress: boolean
  isOffline: boolean
  firstLoading: boolean
  walletInit: WalletInitState
  currencyRates: CurrencyRatesState
}

type Props = NavigationProps<'Overview'> & OwnProps

type State = {}
const Footer = styled.View`
  height: 24px;
`
// background-color: ${() => colors.grey[300]};
const ActionButton = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  flex-direction: row;
  opacity: ${(props) => (props.disabled ? '0.3' : '1')};
  flex: 1;
`
// background-color: red;
const ActionButtonText = styled(Text)`
  font-size: 20;
  padding-left: 8px;
  line-height: 28px;
  color: ${() => colors.blueGrey[800]};
`
const NoTxsView = styled.View`
  padding: 16px;
`
const EmptyTxListMessage = styled(Text)`
  font-size: 18;
  text-align: center;
  color: ${() => colors.blueGrey[800]};
  margin-bottom: 20;
`

class Overview extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  _onDisableBiometry = () => {
    this.props.disableBiometry()
  }
  _onEnableBiometry = () => {
    this.props.enableBiometry()
  }

  componentDidMount() {
    const { settings, route } = this.props
    this.props.txsGet(false, false)

    if (
      settings.biometryType &&
      settings.biometryStatus === BIOMETRY_STATUS.unknown
    ) {
      const biometryName = getBiometryTitle(settings.biometryType)
      biometryName &&
        Alert.alert(
          `Enable ${biometryName}`,
          `Would like to activate ${biometryName} to access the wallet?`,
          [
            {
              text: 'No',
              onPress: this._onDisableBiometry,
            },
            {
              text: 'Yes',
              onPress: this._onEnableBiometry,
            },
          ],
        )
    }
  }

  render() {
    const {
      txListRefreshInProgress,
      txs,
      balance,
      navigation,
      txCancel,
      txsGet,
      settings,
      isOffline,
      firstLoading,
      txConfirm,
      currencyRates,
    } = this.props
    const { currencyObject, minimumConfirmations } = settings
    return (
      <View style={styles.container}>
        <Balance
          balance={balance}
          rates={currencyRates.rates}
          currency={currencyObject}
          navigation={navigation}
        />
        <SwipeListView
          data={txs}
          ListEmptyComponent={
            <NoTxsView>
              {(firstLoading && (
                <EmptyTxListMessage>Loading...</EmptyTxListMessage>
              )) || (
                <Text>
                  Here you will see your transactions, when you've made them!
                </Text>
              )}
            </NoTxsView>
          }
          renderItem={(data: { item: Tx }) => (
            <SwipeRow
              disableRightSwipe
              rightOpenValue={-100}
              disableLeftSwipe={
                data.item.confirmed || data.item.type === 'TxPosted'
              }>
              <View style={styles.cancel}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={(_) =>
                    txCancel(
                      data.item.id,
                      data.item.slateId,
                      !data.item.storedTx,
                    )
                  }>
                  <Text style={styles.cancelButtonText}>{'Cancel'}</Text>
                </TouchableOpacity>
              </View>
              <TouchableHighlight
                onPress={(_) => {
                  if (data.item.confirmed) {
                    navigation.navigate('TxDetails', {
                      txId: data.item.id,
                    })
                  } else if (
                    data.item.type === 'TxFinalized' ||
                    data.item.type === 'TxPosted'
                  ) {
                    txConfirm(data.item.slateId)
                  } else if (data.item.type === 'TxReceived') {
                    navigation.navigate('TxIncompleteReceive', {
                      tx: data.item,
                    })
                  } else if (data.item.type === 'TxSent') {
                    navigation.navigate('TxIncompleteSend', {
                      tx: data.item,
                    })
                  }
                }}
                style={styles.listItem}
                underlayColor={'#FBFBFB'}>
                <TxListItem
                  currency={currencyObject}
                  rates={currencyRates.rates}
                  tx={data.item}
                  minimumConfirmations={minimumConfirmations}
                />
              </TouchableHighlight>
            </SwipeRow>
          )}
          style={styles.txList}
          keyExtractor={(item) => `${item.id}`}
          ListFooterComponent={<Footer />}
          ListHeaderComponent={
            (isOffline && (
              <Text style={styles.offlineWarningText}>
                Grin node is not reachable
              </Text>
            )) ||
            null
          }
          refreshControl={
            <RefreshControl
              refreshing={txListRefreshInProgress}
              onRefresh={() => {
                txsGet(true, true)
              }}
            />
          }
        />
      </View>
    )
  }
}

const mapStateToProps = (state: GlobalState) => {
  return {
    balance: state.balance,
    txListRefreshInProgress: state.tx.list.showLoader,
    txs: state.tx.list.data,
    firstLoading: state.tx.list.lastUpdated === null,
    isOffline: state.tx.list.isOffline,
    settings: state.settings,
    currencyRates: state.currencyRates,
    walletInit: state.wallet.walletInit,
    txFinalizeInProgress: state.tx.txFinalize.inProgress,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  txCancel: (id: number, slateId, isResponse: boolean) => {
    dispatch({
      type: 'TX_CANCEL_REQUEST',
      id,
      slateId,
      isResponse,
    })
  },
  txsGet: (showLoader, refreshFromNode) => {
    dispatch({
      type: 'TX_LIST_REQUEST',
      showLoader,
      refreshFromNode,
    })
  },
  txConfirm: (txSlateId) => {
    dispatch({
      type: 'TX_POST_SHOW',
      txSlateId,
    })
  },
  enableBiometry: () => {
    dispatch({
      type: 'ENABLE_BIOMETRY_REQUEST',
    })
  },
  disableBiometry: () => {
    dispatch({
      type: 'DISABLE_BIOMETRY_REQUEST',
    })
  },
})

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: colors.background,
  },
  txList: {
    paddingTop: 12,
  },
  cancel: {
    alignItems: 'center',
    backgroundColor: colors.warning,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 5,
  },
  cancelButton: {
    height: '100%',
    justifyContent: 'center',
  },
  cancelButtonText: {
    width: 100,
    color: 'white',
    textAlign: 'center',
  },
  listItem: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 0,
    backgroundColor: colors.surface,
    marginVertical: 4,
    marginHorizontal: 16,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 4,
  },
  offlineWarningText: {
    fontWeight: '600',
    fontSize: 16,
    color: colors.warning,
    backgroundColor: colors.background,
    textAlign: 'center',
    paddingBottom: 8,
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Overview)
