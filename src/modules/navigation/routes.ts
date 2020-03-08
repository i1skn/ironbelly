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
import { createSwitchNavigator } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import OverviewScreen from 'src/screens/Overview'
import SendScreen from 'src/screens/Send'
import ReceiveScreen from 'src/screens/Receive'
import ReceiveInfoScreen from 'src/screens/ReceiveInfo'
import ReceiveGuideScreen from 'src/screens/ReceiveGuide'
import SettingsScreen from 'src/screens/Settings'
import TxDetailsScreen from 'src/screens/TxDetails'
import LandingScreen from 'src/screens/Landing'
import InitialScreen from 'src/screens/Initial'
import ShowPaperKeyScreen from 'src/screens/PaperKey/Show'
import VerifyPaperKeyScreen from 'src/screens/PaperKey/Verify'
import PasswordScreen from 'src/screens/Password'
import NewPasswordScreen from 'src/screens/NewPassword'
import WalletScanScreen from 'src/screens/WalletScan'
import SettingsGrinNodeScreen from 'src/screens/Settings/GrinNode'
import SettingsCurrencyScreen from 'src/screens/Settings/Currency'
import LegalDisclaimerScreen from 'src/screens/LegalDisclaimer'
import ScanQRCodeScreen from 'src/screens/ScanQRCode'
import colors from 'src/common/colors'
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
      params: {
        fromSettings: true,
      },
    },
    TxDetails: TxDetailsScreen,
  },
  {
    initialRouteName: 'Overview',
    defaultNavigationOptions,
  },
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
  {
    initialRouteName: 'ReceiveInfo',
    defaultNavigationOptions,
  },
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
  },
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
  },
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
  },
)
export default RootStack
