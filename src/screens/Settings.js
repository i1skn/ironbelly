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

import React, { Component, Fragment } from 'react'
import { FlatList, Alert, Linking } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import NetInfo from '@react-native-community/netinfo'
import { connect } from 'react-redux'
import styled from 'styled-components/native'

import SettingsListItem, { type Props as SettingsItem } from 'components/SettingsListItem'
import { type State as ReduxState, type Error, type Navigation } from 'common/types'
import colors from 'common/colors'
import { type State as SettingsState, BIOMETRY_STATUS } from 'modules/settings'
import { getBiometryTitle } from 'common'
import { Text } from 'components/CustomFont'
import { termsUrl, privacyUrl } from 'screens/LegalDisclaimer'
import { RECOVERY_LIMIT } from 'modules/wallet'

const VersionText = styled(Text)`
  text-align: center;
  padding-bottom: 16px;
`

type Props = {
  setCheckNodeApiHttpAddr: (checkNodeApiHttpAddr: string) => void,
  setChain: (chain: string) => void,
  getPhrase: () => void,
  destroyWallet: () => void,
  repairWallet: () => void,
  migrateToMainnet: () => void,
  settings: SettingsState,
  error: Error,
  isCreated: boolean,
  navigation: Navigation,
  isFloonet: boolean,
  enableBiometry: () => void,
  disableBiometry: () => void,
  walletScan: () => void,
}
type State = {
  inputValue: string,
  amount: number,
  valid: boolean,
}

class Settings extends Component<Props, State> {
  static navigationOptions = {
    title: 'Settings',
  }

  state = {}

  componentDidMount() {
    // this.props.setCheckNodeApiHttpAddr('http://floonode.cycle42.com:13413')
    // this.props.setChain('floonet')
  }

  componentDidUpdate(prevProps) {}

  _onMigrateToMainnet = () => {
    return Alert.alert('Switch to Mainnet', 'This would destroy your floonet wallet!', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Switch',
        style: 'destructive',
        onPress: () => {
          this.props.migrateToMainnet()
        },
      },
    ])
  }
  _onDestroyWallet = () => {
    return Alert.alert(
      'Destroy this wallet',
      'This action would remove all of your data! Please back up your recovery phrase before!',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Destroy',
          style: 'destructive',
          onPress: () => {
            this.props.destroyWallet()
          },
        },
      ]
    )
  }
  _onGrinNode = () => {
    this.props.navigation.navigate('SettingsGrinNode')
  }
  _onCurrency = () => {
    this.props.navigation.navigate('SettingsCurrency')
  }
  _onRepairWallet = () => {
    let title = 'Repair this wallet'
    let desc =
      "This action would check a wallet's outputs against a live node, repair and restore missing outputs if required"
    NetInfo.getConnectionInfo().then(({ type }) => {
      if (type === 'none') {
        Alert.alert(`Device is offline`, `Wallet recovery requires connection to the internet!`, [
          {
            text: 'Ok',
            onPress: () => {},
          },
        ])
        return
      }
      if (type !== 'wifi') {
        desc = `${desc}. It requires to download A LOT OF DATA. Consider, that depend on your internet provider additional costs may occur!`
      }
      Alert.alert(title, desc, [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Continue',
          style: 'default',
          onPress: () => {
            this.props.walletScan()
            this.props.navigation.navigate('WalletScan')
          },
        },
      ])
    })
  }

  render() {
    const { settings, navigation, getPhrase, isFloonet } = this.props
    const listData = [
      // { key: 'currency', title: 'Currency', value: 'EUR', onPress: () => {} },
      {
        key: 'grin_node',
        title: 'Grin node',
        onPress: this._onGrinNode,
      },
      {
        key: 'currency',
        title: 'Currency',
        value: settings.currencyObject.code.toUpperCase(),
        onPress: this._onCurrency,
      },
      {
        key: 'paperkey',
        title: 'Paper key',
        onPress: () => {
          getPhrase()
          navigation.navigate('ViewPaperKey')
        },
      },
      {
        key: 'repair',
        title: 'Repair this wallet',
        onPress: this._onRepairWallet,
        hideChevron: true,
      },
      {
        key: 'feedback',
        title: 'Got feeback?',
        hideChevron: true,
        onPress: () => {
          Linking.openURL('mailto:support@ironbelly.app')
        },
      },
      {
        key: 'terms',
        title: 'Terms of Use',
        hideChevron: true,
        onPress: () => {
          Linking.openURL(termsUrl)
        },
      },
      {
        key: 'privacy',
        title: 'Privacy Policy',
        hideChevron: true,
        onPress: () => {
          Linking.openURL(privacyUrl)
        },
      },
      {
        key: 'destroy',
        title: 'Destroy this wallet',
        titleStyle: {
          color: colors.warning,
        },
        hideChevron: true,
        onPress: () => this._onDestroyWallet(),
      },
    ]
    if (settings.biometryType) {
      listData.splice(0, 0, {
        key: 'biometryEnabled',
        title: getBiometryTitle(settings.biometryType),
        hideChevron: true,
        value: settings.biometryStatus === BIOMETRY_STATUS.enabled,
        onValueChange: (value: boolean) => {
          if (value) {
            this.props.enableBiometry()
          } else {
            this.props.disableBiometry()
          }
        },
      })
    }
    if (isFloonet) {
      listData.splice(0, 0, {
        key: 'chain',
        title: 'Switch to Mainnet',
        hideChevron: true,
        onPress: () => this._onMigrateToMainnet(),
        titleStyle: {
          color: colors.success,
          fontWeight: '600',
        },
      })
    }
    return (
      <Fragment>
        <FlatList
          style={{ paddingLeft: 16 }}
          data={listData}
          renderItem={({ item }: { item: SettingsItem }) => <SettingsListItem {...item} />}
        />
        <VersionText style={{}}>
          Version: {DeviceInfo.getVersion()} build {DeviceInfo.getBuildNumber()}
        </VersionText>
      </Fragment>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  settings: state.settings,
  isCreated: state.tx.txCreate.created,
  error: state.tx.txCreate.error,
  isFloonet: state.settings.chain === 'floonet',
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setCheckNodeApiHttpAddr: (checkNodeApiHttpAddr: string) => {
    dispatch({ type: 'SET_SETTINGS', newSettings: { checkNodeApiHttpAddr } })
  },
  setChain: (chain: string) => {
    dispatch({ type: 'SET_SETTINGS', newSettings: { chain } })
  },
  getPhrase: () => {
    dispatch({ type: 'WALLET_PHRASE_REQUEST' })
  },
  destroyWallet: () => {
    dispatch({ type: 'WALLET_DESTROY_REQUEST' })
  },
  migrateToMainnet: () => {
    dispatch({ type: 'WALLET_MIGRATE_TO_MAINNET_REQUEST' })
  },
  enableBiometry: () => {
    dispatch({ type: 'ENABLE_BIOMETRY_REQUEST' })
  },
  disableBiometry: () => {
    dispatch({ type: 'DISABLE_BIOMETRY_REQUEST' })
  },
  walletScan: () => {
    dispatch({
      type: 'WALLET_SCAN_REQUEST',
      startIndex: 0,
      limit: RECOVERY_LIMIT,
    })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings)
