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

import React from 'react'
import { Dispatch, NavigationProps } from 'src/common/types'
import { RootState } from 'src/common/redux'
import { Alert, Linking, SectionList, ColorSchemeName } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import NetInfo from '@react-native-community/netinfo'
import { connect } from 'react-redux'
import SettingsListItem, {
  Props as SettingsListItemProps,
} from 'src/components/SettingsListItem'
import {
  State as SettingsState,
  BIOMETRY_STATUS,
  lockInBackgroundSelector,
} from 'src/modules/settings'
import { getBiometryTitle } from 'src/common'
import { Text } from 'src/components/CustomFont'
import { termsUrl, privacyUrl } from 'src/screens/LegalDisclaimer'
import { passwordScreenMode } from 'src/modules/navigation'
import {
  slightlyTransparent,
  styleSheetFactory,
  useThemedStyles,
} from 'src/themes'

interface StateProps {
  settings: SettingsState
  isCreated: boolean
  isFloonet: boolean
  lockInBackground: boolean
}

interface DispatchProps {
  enableBiometry: () => void
  disableBiometry: () => void
  walletScan: () => void
  setCheckNodeApiHttpAddr: (checkNodeApiHttpAddr: string) => void
  setChain: (chain: RootState['settings']['chain']) => void
  destroyWallet: () => void
  migrateToMainnet: () => void
  setTheme: (theme: ColorSchemeName) => void
  setlockInBackground: (value: boolean) => void
}
type Props = NavigationProps<'Settings'> & StateProps & DispatchProps

function Settings(props: Props) {
  const [styles] = useThemedStyles(themedStyles)
  const _onMigrateToMainnet = () => {
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
            props.migrateToMainnet()
          },
        },
      ],
    )
  }
  const _onDestroyWallet = () => {
    return Alert.alert(
      'Destroy this wallet',
      "This action would remove all of your data! Please back up your recovery phrase before! \n\nDO NOT do it, if you have a problematic transaction (e.g. with an exchange). You would loose the information, which could help to identify your transactions! Contact the other party's support first!",
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
            props.destroyWallet()
          },
        },
      ],
    )
  }
  const _onGrinNode = () => {
    props.navigation.navigate('SettingsGrinNode')
  }
  const _onCurrency = () => {
    props.navigation.navigate('SettingsCurrency')
  }
  const _onDarkMode = () => {
    props.setTheme(props.settings.theme === 'dark' ? 'light' : 'dark')
  }

  const _onRepairWallet = () => {
    const title = 'Repair this wallet'
    let desc =
      "This would do a complete rescan of the blockchain to find all your transactions.\n\nDO NOT do it, if you have a problematic transaction (e.g. with an exchange). You could loose the information, which could help to identify your transactions! Contact the other party's support first!"
    NetInfo.fetch().then(({ type }) => {
      if (type === 'none') {
        Alert.alert(
          'Device is offline',
          'Wallet recovery requires connection to the internet!',
          [
            {
              text: 'Ok',
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
          text: 'Repair',
          style: 'destructive',
          onPress: () => {
            props.walletScan()
            props.navigation.navigate('WalletScan')
          },
        },
      ])
    })
  }

  const { settings, navigation, isFloonet } = props
  const mainListData: Array<SettingsListItemProps> = [
    {
      title: 'Grin node',
      onPress: _onGrinNode,
    },
    {
      title: 'Base Currency',
      value: settings.currencyObject.code.toUpperCase(),
      onPress: _onCurrency,
    },
    // TODO: Uncomment once dark mode is ready
    // {
    // title: 'Dark Theme',
    // value: settings.theme === 'dark',
    // hideChevron: true,
    // onValueChange: _onDarkMode,
    // },
  ]

  const securityListData: Array<SettingsListItemProps> = [
    {
      title: 'Paper key',
      onPress: () => {
        navigation.navigate('Password', {
          mode: passwordScreenMode.PAPER_KEY,
        })
      },
    },
    {
      title: 'Lock in background',
      hideChevron: true,
      value: settings.lockInBackground,
      onValueChange: () => {
        props.setlockInBackground(!settings.lockInBackground)
      },
    },
  ]

  const resourcesListData: Array<SettingsListItemProps> = [
    {
      title: 'Support',
      hideChevron: true,
      onPress: () => {
        navigation.navigate('SettingsSupport')
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
      onPress: _onRepairWallet,
      hideChevron: true,
    },
    {
      title: 'Destroy this wallet',
      hideChevron: true,
      onPress: () => _onDestroyWallet(),
    },
  ]

  if (settings.biometryType) {
    securityListData.splice(0, 0, {
      title: getBiometryTitle(settings.biometryType),
      hideChevron: true,
      value: settings.biometryStatus === BIOMETRY_STATUS.enabled,
      onValueChange: (value: boolean) => {
        if (value) {
          props.enableBiometry()
        } else {
          props.disableBiometry()
        }
      },
    })
  }

  if (isFloonet) {
    dangerousListData.splice(0, 0, {
      title: 'Switch to Mainnet',
      hideChevron: true,
      onPress: () => _onMigrateToMainnet(),
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
      keyExtractor={(item: SettingsListItemProps, index) => item.title + index}
      renderItem={({ item }: { item: SettingsListItemProps }) => (
        <SettingsListItem {...item} />
      )}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionTitle}>{section.title}</Text>
      )}
      ListFooterComponent={
        <Text style={styles.versionText}>
          Version: {DeviceInfo.getVersion()} build {DeviceInfo.getBuildNumber()}
        </Text>
      }
      stickySectionHeadersEnabled={false}
    />
  )
}

const themedStyles = styleSheetFactory(theme => ({
  container: {
    flexGrow: 1,
    backgroundColor: theme.background,
  },
  sectionTitle: {
    paddingTop: 28,
    paddingBottom: 8,
    paddingHorizontal: 16,
    color: slightlyTransparent(theme.onBackground),
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    paddingVertical: 16,
    color: slightlyTransparent(theme.onBackground),
  },
}))

const mapStateToProps = (state: RootState): StateProps => ({
  settings: state.settings,
  isCreated: state.tx.txCreate.created,
  isFloonet: state.settings.chain === 'floonet',
  lockInBackground: lockInBackgroundSelector(state),
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
  setTheme: (theme: ColorSchemeName) => {
    dispatch({
      type: 'SET_SETTINGS',
      newSettings: {
        theme,
      },
    })
  },

  setChain: (chain: RootState['settings']['chain']) => {
    dispatch({
      type: 'SET_SETTINGS',
      newSettings: {
        chain,
      },
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
  setlockInBackground: (value: boolean) => {
    dispatch({
      type: 'SET_LOCK_IN_BACKGROUND',
      value,
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

export default connect<
  StateProps,
  DispatchProps,
  Record<string, never>,
  RootState
>(
  mapStateToProps,
  mapDispatchToProps,
)(Settings)
