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

import React, { useCallback, useEffect } from 'react'
import { TouchableOpacity, RefreshControl, View } from 'react-native'
import { connect, useDispatch } from 'react-redux'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import { Text } from 'src/components/CustomFont'
import Balance from 'src/components/Balance'
import TxListItem from 'src/components/TxListItem'
import { State as CurrencyRatesState } from 'src/modules/currency-rates'
import { RootState } from 'src/common/redux'
import { Balance as BalanceType, Dispatch, Tx } from 'src/common/types'
import { WalletInitState } from 'src/modules/wallet'
import { State as SettingsState } from 'src/modules/settings'
import { NavigationProps } from 'src/common/types'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { styleSheetFactory, useThemedStyles } from 'src/themes'

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

function Overview({
  txListRefreshInProgress,
  txsGet,
  txs,
  balance,
  txCancel,
  settings,
  isOffline,
  firstLoading,
  txConfirm,
  currencyRates,
  navigation,
}: Props) {
  const dispatch = useDispatch()

  useEffect(() => {
    txsGet(false, false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      dispatch({
        type: 'TX_FORM_RESET',
      })
    }, []),
  )

  const [styles] = useThemedStyles(themedStyles)

  const { currencyObject, minimumConfirmations } = settings
  return (
    <View style={styles.container}>
      <Balance
        balance={balance}
        rates={currencyRates.rates}
        currency={currencyObject}
      />
      <SwipeListView
        data={txs}
        ListEmptyComponent={
          <View style={styles.noTxs}>
            {(firstLoading && (
              <Text style={styles.emptyLog}>Loading...</Text>
            )) || (
              <Text style={styles.noTxsText}>
                Here you will see your transactions, when you've made them!
              </Text>
            )}
          </View>
        }
        renderItem={(data: { item: Tx }) => (
          <SwipeRow
            disableRightSwipe
            rightOpenValue={-100}
            disableLeftSwipe={
              data.item.confirmed ||
              data.item.type === 'TxPosted' ||
              !data.item.slateId
            }>
            <View style={styles.cancel}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  if (data.item.slateId) {
                    txCancel(
                      data.item.id,
                      data.item.slateId,
                      !data.item.storedTx,
                    )
                  }
                }}>
                <Text style={styles.cancelButtonText}>{'Cancel'}</Text>
              </TouchableOpacity>
            </View>
            <View>
              <View style={styles.listItem}>
                <TxListItem
                  currency={currencyObject}
                  rates={currencyRates.rates}
                  tx={data.item}
                  minimumConfirmations={minimumConfirmations}
                  onPress={() => {
                    if (data.item.confirmed) {
                      navigation.navigate('TxDetails', {
                        txId: data.item.id,
                      })
                    } else if (
                      (data.item.type === 'TxFinalized' ||
                        data.item.type === 'TxPosted') &&
                      data.item.slateId
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
                />
              </View>
            </View>
          </SwipeRow>
        )}
        style={styles.txList}
        keyExtractor={item => `${item.id}`}
        ListFooterComponent={<View style={styles.footer} />}
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

const mapStateToProps = (state: RootState) => {
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
  txCancel: (id: number, slateId: string, isResponse: boolean) => {
    dispatch({
      type: 'TX_CANCEL_REQUEST',
      id,
      slateId,
      isResponse,
    })
  },
  txsGet: (showLoader: boolean, refreshFromNode: boolean) => {
    dispatch({
      type: 'TX_LIST_REQUEST',
      showLoader,
      refreshFromNode,
    })
  },
  txConfirm: (txSlateId: string) => {
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

const themedStyles = styleSheetFactory(theme => ({
  container: {
    height: '100%',
  },
  txList: {
    paddingTop: 12,
  },
  cancel: {
    alignItems: 'center',
    backgroundColor: theme.background,
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
    color: theme.warning,
    textAlign: 'center',
  },
  listItem: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 0,
    backgroundColor: theme.surface,
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
    color: theme.warning,
    backgroundColor: theme.background,
    textAlign: 'center',
    paddingBottom: 8,
  },
  emptyLog: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: theme.onBackground,
  },
  noTxsText: {
    color: theme.onBackground,
    textAlign: 'center',
  },
  footer: {
    height: 24,
  },
  noTxs: {
    padding: 16,
  },
}))

export default connect(mapStateToProps, mapDispatchToProps)(Overview)
