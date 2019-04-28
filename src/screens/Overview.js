// @flow
//
// Copyright 2019 Ivan Sorokin.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { Component } from 'react'
import { Alert, TouchableHighlight, TouchableOpacity, RefreshControl, View } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view'
import { Text, Button } from 'components/CustomFont'
import Balance from 'components/Balance'
import RecoveryProgress from 'components/RecoveryProgress'
import HeaderSpan from 'components/HeaderSpan'
import TxListItem from 'components/TxListItem'
import { isIphoneX } from 'react-native-iphone-x-helper'
import { BIOMETRY_STATUS } from 'modules/settings'

import {
  type Balance as BalanceType,
  type State as GlobalState,
  type Tx,
  type Navigation,
} from 'common/types'
import colors from 'common/colors'
import { getBiometryTitle } from 'common'

import { type WalletInitState } from 'modules/wallet'
import { type State as SettingsState } from 'modules/settings'

//Images
import SendTXImg from 'assets/images/SendTX.png'

type Props = {
  getBalance: () => void,
  balance: BalanceType,
  txs: Array<Tx>,
  settings: SettingsState,
  txCancel: (id: number, slateId: string, isResponse: boolean) => void,
  txsGet: (showLoader: boolean, refreshFromNode: boolean) => void,
  resetTxForm: () => void,
  enableBiometry: () => void,
  disableBiometry: () => void,
  txConfirm: (txSlateId: string) => void,
  txFinalize: (txSlateId: string) => void,
  slateShare: (id: string, isResponse: boolean) => void,
  navigation: Navigation,
  txListRefreshInProgress: boolean,
  isOffline: boolean,
  firstLoading: boolean,
  walletInit: WalletInitState,
}

type State = {}

const Wrapper = styled.View`
  height: 100%;
`
const ActionButtonTH = styled.TouchableOpacity`
  position: absolute;
  bottom: ${isIphoneX() ? -40 : -50};
  justify-content: center;
  align-items: center;
  width: 120;
  height: 120;
  background-color: ${() => colors.primary};
  border-radius: 60;
  align-self: center;
  opacity: ${props => (props.disabled ? '0.3' : '1')};
`

const ActionButtonIcon = styled.Image`
  width: 28;
  height: 28;
  margin-top: -40;
`
const ActionButtonText = styled(Text)`
  font-size: 16;
`

const NoTxsView = styled.View`
  padding: 16px;
`
const ActionButton = (props: any) => {
  const { title, icon } = props
  return (
    <ActionButtonTH onPress={props.onPress} disabled={props.disabled}>
      <React.Fragment>
        <ActionButtonIcon source={icon} />
        <ActionButtonText>{title}</ActionButtonText>
      </React.Fragment>
    </ActionButtonTH>
  )
}

const ListItemSeparator = styled.View`
  height: 1;
  width: 100%;
  background-color: #dedede;
`

const EmptyTxListMessage = styled(Text)`
  font-size: 18;
  text-align: center;
  color: ${() => colors.grey[900]};
  margin-bottom: 20;
`
class Overview extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props)
  }

  _onDisableBiometry = () => {
    this.props.disableBiometry()
  }
  _onEnableBiometry = () => {
    this.props.enableBiometry()
  }
  componentDidMount() {
    const { walletInit, settings } = this.props
    if (!walletInit.inProgress) {
      this.props.getBalance()
      this.props.txsGet(false, true)
    }
    const { responseSlatePath } = this.props.navigation.state.params
    if (responseSlatePath) {
      this.props.txFinalize(responseSlatePath)
    }
    if (settings.biometryType && settings.biometryStatus === BIOMETRY_STATUS.unknown) {
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
          ]
        )
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.walletInit.error.message && !prevProps.walletInit.error.message) {
      this.props.navigation.navigate('Initial')
    }
    if (
      this.props.walletInit.inProgress !== prevProps.walletInit.inProgress &&
      !this.props.walletInit.inProgress
    ) {
      this.props.txsGet(false, true)
    }

    if (
      this.props.navigation.state.params.responseSlatePath !==
      prevProps.navigation.state.params.responseSlatePath
    ) {
      this.props.txFinalize(this.props.navigation.state.params.responseSlatePath)
    }
  }

  render() {
    const {
      txListRefreshInProgress,
      txs,
      balance,
      navigation,
      getBalance,
      txCancel,
      txsGet,
      slateShare,
      settings,
      resetTxForm,
      walletInit,
      isOffline,
      firstLoading,
      txConfirm,
    } = this.props
    const { currency, chain, minimumConfirmations } = settings
    return (
      <Wrapper>
        <HeaderSpan bgColor={colors.primary} />

        {(walletInit.inProgress && <RecoveryProgress />) || (
          <Balance
            isFloonet={chain === 'floonet'}
            balance={balance}
            currency={currency}
            isOffline={isOffline}
            navigation={navigation}
            minimumConfirmations={minimumConfirmations}
          />
        )}
        <SwipeListView
          useFlatList
          data={txs}
          ListEmptyComponent={
            !walletInit.inProgress && (
              <NoTxsView>
                {(firstLoading && <EmptyTxListMessage>Loading...</EmptyTxListMessage>) || (
                  <Button
                    testID="TopUpButton"
                    onPress={() => navigation.navigate('Topup')}
                    title="Top up balance?"
                  />
                )}
              </NoTxsView>
            )
          }
          ItemSeparatorComponent={ListItemSeparator}
          renderItem={(data: { item: Tx }, rowMap) => (
            <SwipeRow
              disableRightSwipe
              rightOpenValue={-100}
              disableLeftSwipe={data.item.confirmed || data.item.type === 'TxPosted'}
            >
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: 'red',
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}
              >
                <TouchableOpacity
                  style={{
                    height: '100%',
                    justifyContent: 'center',
                  }}
                  onPress={_ => txCancel(data.item.id, data.item.slateId, !data.item.storedTx)}
                >
                  <Text
                    style={{
                      width: 100,
                      color: 'white',
                      textAlign: 'center',
                    }}
                  >
                    {'Cancel'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableHighlight
                onPress={_ => {
                  if (data.item.confirmed || data.item.type === 'TxPosted') {
                    navigation.navigate('TxDetails', { txId: data.item.id })
                  } else if (data.item.type === 'TxFinalized') {
                    txConfirm(data.item.slateId)
                  } else {
                    slateShare(data.item.slateId, !data.item.storedTx)
                  }
                }}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
                underlayColor={'#FBFBFB'}
              >
                <TxListItem
                  currency={currency}
                  tx={data.item}
                  minimumConfirmations={minimumConfirmations}
                />
              </TouchableHighlight>
            </SwipeRow>
          )}
          contentContainerStyle={{
            paddingBottom: 110,
            backgroundColor: '#fff',
          }}
          keyExtractor={item => `${item.id}`}
          refreshControl={
            <RefreshControl
              refreshing={txListRefreshInProgress}
              onRefresh={() => {
                getBalance()
                txsGet(true, true)
              }}
            />
          }
        />
        {!walletInit.inProgress && (
          <ActionButton
            title="Send"
            disabled={!balance.amountCurrentlySpendable}
            icon={SendTXImg}
            onPress={() => {
              resetTxForm()
              navigation.navigate('Send')
            }}
          />
        )}
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: GlobalState) => {
  return {
    balance: state.balance.data,
    txListRefreshInProgress: state.tx.list.showLoader,
    txs: state.tx.list.data,
    firstLoading: state.tx.list.lastUpdated === null,
    isOffline: state.tx.list.isOffline,
    settings: state.settings,
    walletInit: state.wallet.walletInit,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  getBalance: () => {
    dispatch({ type: 'BALANCE_REQUEST' })
  },
  txCancel: (id: number, slateId, isResponse: boolean) => {
    dispatch({ type: 'TX_CANCEL_REQUEST', id, slateId, isResponse })
  },
  txsGet: (showLoader, refreshFromNode) => {
    dispatch({ type: 'TX_LIST_REQUEST', showLoader, refreshFromNode })
  },
  slateShare: (id: string, isResponse: boolean) => {
    dispatch({ type: 'SLATE_SHARE_REQUEST', id, isResponse })
  },
  resetTxForm: () => {
    dispatch({ type: 'TX_FORM_SET_AMOUNT', amount: 0, textAmount: '' })
    dispatch({ type: 'TX_FORM_SET_MESSAGE', message: '' })
  },
  txFinalize: responseSlatePath => {
    dispatch({ type: 'TX_FINALIZE_REQUEST', responseSlatePath })
  },
  txConfirm: txSlateId => {
    dispatch({ type: 'TX_POST_SHOW', txSlateId })
  },
  enableBiometry: () => {
    dispatch({ type: 'ENABLE_BIOMETRY_REQUEST' })
  },
  disableBiometry: () => {
    dispatch({ type: 'DISABLE_BIOMETRY_REQUEST' })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Overview)
