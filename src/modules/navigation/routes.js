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
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation'

import OverviewScreen from 'screens/Overview'
import SendScreen from 'screens/Send/main'
import SendLinkScreen from 'screens/SendLink/main'
import ReceiveScreen from 'screens/Receive'
import SettingsScreen from 'screens/Settings'
import TxDetailsScreen from 'screens/TxDetails'
import LandingScreen from 'screens/Landing'
import InitialScreen from 'screens/Initial'
import ShowPaperKeyScreen from 'screens/PaperKey/Show'
import VerifyPaperKeyScreen from 'screens/PaperKey/Verify'
import RecoveryScreen from 'screens/Recovery/main'
import TopupScreen from 'screens/Topup'
import PasswordScreen from 'screens/Password'
import RecoveryInProgressScreen from 'screens/RecoveryInProgress'
import NewPasswordScreen from 'screens/NewPassword'
import WalletPrepareScreen from 'screens/WalletPrepare'

import colors from 'common/colors'
import { appFont } from 'components/CustomFont'

const defaultNavigationOptions = {
  headerTintColor: colors.black,
  headerTitleStyle: {
    fontWeight: 'bold',
    fontFamily: appFont,
  },
  headerStyle: {
    borderBottomWidth: 0,
    backgroundColor: colors.primary,
  },
  headerBackTitleStyle: {
    fontFamily: appFont,
    color: colors.black,
  },
}
const MainStack = createStackNavigator(
  {
    Settings: SettingsScreen,
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

const AppStack = createStackNavigator(
  {
    Main: MainStack,
    Send: SendScreen,
    SendLink: SendLinkScreen,
    Topup: TopupScreen,
    Receive: ReceiveScreen,
  },
  {
    initialRouteName: 'Main',
    mode: 'modal',
    headerMode: 'none',
    defaultNavigationOptions,
  }
)

const WalletCreateStack = createStackNavigator(
  {
    Landing: LandingScreen,
    NewPassword: NewPasswordScreen,
    ShowPaperKey: ShowPaperKeyScreen,
    VerifyPaperKey: VerifyPaperKeyScreen,
    Recovery: RecoveryScreen,
    RecoveryInProgress: RecoveryInProgressScreen,
    WalletPrepare: WalletPrepareScreen,
  },
  {
    initialRouteName: 'Landing',
    defaultNavigationOptions,
  }
)

const RootStack = createSwitchNavigator(
  {
    Password: PasswordScreen,
    App: AppStack,
    Initial: InitialScreen,
    WalletCreate: WalletCreateStack,
  },
  {
    initialRouteName: 'Initial',
  }
)

export default RootStack
