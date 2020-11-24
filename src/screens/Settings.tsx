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
  Dispatch,
  State as GlobalState,
  NavigationProps,
} from 'src/common/types'
import {
  FlatList,
  Alert,
  Linking,
  StyleSheet,
  ScrollView,
  SectionList,
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import NetInfo from '@react-native-community/netinfo'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import SettingsListItem, {
  Props as SettingsListItemProps,
} from 'src/components/SettingsListItem'
import colors from 'src/common/colors'
import { State as SettingsState, BIOMETRY_STATUS } from 'src/modules/settings'
import { getBiometryTitle } from 'src/common'
import { Text } from 'src/components/CustomFont'
import { termsUrl, privacyUrl } from 'src/screens/LegalDisclaimer'
const VersionText = styled(Text)`
  text-align: center;
  padding-vertical: 16px;
  color: ${colors.onBackgroundLight};
`
interface StateProps {
  settings: SettingsState
  isCreated: boolean
  isFloonet: boolean
}
interface DispatchProps {
  enableBiometry: () => void
  disableBiometry: () => void
  walletScan: () => void
  setCheckNodeApiHttpAddr: (checkNodeApiHttpAddr: string) => void
  setChain: (chain: GlobalState['settings']['chain']) => void
  getPhrase: () => void
  destroyWallet: () => void
  migrateToMainnet: () => void
}
type Props = NavigationProps<'Settings'> & StateProps & DispatchProps

type State = {}

class Settings extends Component<Props, State> {
  state = {}

  _onMigrateToMainnet = () => {
    return Alert.alert(
      'Switch to Mainnet',
      'This would destroy your floonet wallet!',
      [
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
      ],
    )
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
      ],
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
    NetInfo.fetch().then(({ type }) => {
      if (type === 'none') {
        Alert.alert(
          'Device is offline',
          'Wallet recovery requires connection to the internet!',
          [
            {
              text: 'Ok',
              onPress: () => {},
            },
          ],
        )
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
    const mainListData: Array<SettingsListItemProps> = [
      {
        title: 'Grin node',
        onPress: this._onGrinNode,
      },
      {
        title: 'Base Currency',
        value: settings.currencyObject.code.toUpperCase(),
        onPress: this._onCurrency,
      },
    ]

    const securityListData: Array<SettingsListItemProps> = [
      {
        title: 'Paper key',
        onPress: () => {
          getPhrase()
          navigation.navigate('ViewPaperKey')
        },
      },
    ]

    const resourcesListData: Array<SettingsListItemProps> = [
      {
        title: 'Support',
        hideChevron: true,
        onPress: () => {
          Linking.openURL('mailto:support@ironbelly.app')
        },
      },
      {
        title: 'Open Source',
        hideChevron: true,
        isLink: false,
        onPress: () => {
          navigation.navigate('Licenses')
        },
      },
      {
        title: 'Terms of Use',
        hideChevron: true,
        isLink: true,
        onPress: () => {
          Linking.openURL(termsUrl)
        },
      },
      {
        title: 'Privacy Policy',
        hideChevron: true,
        isLink: true,
        onPress: () => {
          Linking.openURL(privacyUrl)
        },
      },
    ]
    const dangerousListData: Array<SettingsListItemProps> = [
      {
        title: 'Repair this wallet',
        onPress: this._onRepairWallet,
        hideChevron: true,
      },
      {
        title: 'Destroy this wallet',
        hideChevron: true,
        onPress: () => this._onDestroyWallet(),
      },
    ]

    if (settings.biometryType) {
      securityListData.splice(0, 0, {
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
      dangerousListData.splice(0, 0, {
        title: 'Switch to Mainnet',
        hideChevron: true,
        onPress: () => this._onMigrateToMainnet(),
      })
    }

    const data = [
      { title: 'Main', data: mainListData },
      { title: 'Security', data: securityListData },
      { title: 'Resources', data: resourcesListData },
      { title: 'Dangerous Zone', data: dangerousListData },
    ]

    return (
      <SectionList
        style={styles.container}
        sections={data}
        initialNumToRender={20}
        keyExtractor={(item: SettingsListItemProps, index) =>
          item.title + index
        }
        renderItem={({ item }: { item: SettingsListItemProps }) => (
          <SettingsListItem {...item} />
        )}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        ListFooterComponent={
          <VersionText>
            Version: {DeviceInfo.getVersion()} build{' '}
            {DeviceInfo.getBuildNumber()}
          </VersionText>
        }
        stickySectionHeadersEnabled={false}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    paddingTop: 28,
    paddingBottom: 8,
    paddingHorizontal: 16,
    color: colors.onBackgroundLight,
    fontWeight: '600',
  },
})

const mapStateToProps = (state: GlobalState): StateProps => ({
  settings: state.settings,
  isCreated: state.tx.txCreate.created,
  isFloonet: state.settings.chain === 'floonet',
})

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
  setCheckNodeApiHttpAddr: (checkNodeApiHttpAddr: string) => {
    dispatch({
      type: 'SET_SETTINGS',
      newSettings: {
        checkNodeApiHttpAddr,
      },
    })
  },
  setChain: (chain: GlobalState['settings']['chain']) => {
    dispatch({
      type: 'SET_SETTINGS',
      newSettings: {
        chain,
      },
    })
  },
  getPhrase: () => {
    dispatch({
      type: 'WALLET_PHRASE_REQUEST',
    })
  },
  destroyWallet: () => {
    dispatch({
      type: 'WALLET_DESTROY_REQUEST',
    })
  },
  migrateToMainnet: () => {
    dispatch({
      type: 'WALLET_MIGRATE_TO_MAINNET_REQUEST',
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
  walletScan: () => {
    dispatch({
      type: 'WALLET_SCAN_START',
    })
  },
})

export default connect<StateProps, DispatchProps, {}, GlobalState>(
  mapStateToProps,
  mapDispatchToProps,
)(Settings)
