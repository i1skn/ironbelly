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
import { createStackNavigator, createSwitchNavigator } from 'react-navigation'

import OverviewScreen from 'screens/Overview'
import SendScreen from 'screens/Send'
import ReceiveScreen from 'screens/Receive'
import ReceiveInfoScreen from 'screens/ReceiveInfo'
import ReceiveGuideScreen from 'screens/ReceiveGuide'
import SettingsScreen from 'screens/Settings'
import TxDetailsScreen from 'screens/TxDetails'
import LandingScreen from 'screens/Landing'
import InitialScreen from 'screens/Initial'
import ShowPaperKeyScreen from 'screens/PaperKey/Show'
import VerifyPaperKeyScreen from 'screens/PaperKey/Verify'
import PasswordScreen from 'screens/Password'
import NewPasswordScreen from 'screens/NewPassword'
import WalletScanScreen from 'screens/WalletScan'
import SettingsGrinNodeScreen from 'screens/Settings/GrinNode'
import SettingsCurrencyScreen from 'screens/Settings/Currency'
import LegalDisclaimerScreen from 'screens/LegalDisclaimer'
import ScanQRCodeScreen from 'screens/ScanQRCode'

import colors from 'common/colors'

const defaultNavigationOptions = {
  headerTintColor: colors.black,
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  headerStyle: {
    borderBottomWidth: 0,
    backgroundColor: colors.primary,
  },
  headerBackTitleStyle: {
    color: colors.black,
  },
}
const MainStack = createStackNavigator(
  {
    Settings: SettingsScreen,
    SettingsGrinNode: SettingsGrinNodeScreen,
    SettingsCurrency: SettingsCurrencyScreen,
    Overview: {
      screen: OverviewScreen,
      params: {},
    },
    ViewPaperKey: {
      screen: ShowPaperKeyScreen,
      params: { fromSettings: true },
    },
    TxDetails: TxDetailsScreen,
  },
  {
    initialRouteName: 'Overview',
    defaultNavigationOptions,
  }
)

MainStack.navigationOptions = {
  header: null,
  headerBackTitle: 'Back',
}

const ReceiveInfoStack = createStackNavigator(
  {
    ReceiveInfo: ReceiveInfoScreen,
    ReceiveGuide: ReceiveGuideScreen,
  },
  { initialRouteName: 'ReceiveInfo', defaultNavigationOptions }
)

ReceiveInfoStack.navigationOptions = {
  header: null,
}

const AppStack = createStackNavigator(
  {
    Main: MainStack,
    Send: SendScreen,
    Receive: ReceiveScreen,
    ReceiveInfoStack: ReceiveInfoStack,
    ScanQRCode: ScanQRCodeScreen,
  },
  {
    initialRouteName: 'Main',
    mode: 'modal',
    defaultNavigationOptions,
  }
)

const WalletCreateStack = createStackNavigator(
  {
    Landing: LandingScreen,
    LegalDisclaimer: {
      screen: LegalDisclaimerScreen,
    },
    NewPassword: NewPasswordScreen,
    ShowPaperKey: ShowPaperKeyScreen,
    VerifyPaperKey: VerifyPaperKeyScreen,
    WalletScan: WalletScanScreen,
  },
  {
    initialRouteName: 'Landing',
    defaultNavigationOptions,
  }
)

const RootStack = createSwitchNavigator(
  {
    App: AppStack,
    Initial: InitialScreen,
    Password: PasswordScreen,
    WalletCreate: WalletCreateStack,
  },
  {
    initialRouteName: 'Initial',
  }
)

export default RootStack
