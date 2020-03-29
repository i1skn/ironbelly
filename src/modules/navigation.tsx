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
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import OverviewScreen from 'src/screens/Overview'
import SendScreen from 'src/screens/Send'
import ReceiveScreen from 'src/screens/Receive'
import ReceiveInfoScreen from 'src/screens/ReceiveInfo'
import ReceiveGuideScreen from 'src/screens/ReceiveGuide'
import SettingsScreen from 'src/screens/Settings'
import TxDetailsScreen from 'src/screens/TxDetails'
import LandingScreen from 'src/screens/Landing'
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

const defaultScreenOptions = {
  headerTintColor: colors.black,
  headerTitleStyle: {
    // fontWeight: '600',
  },
  headerStyle: {
    borderBottomWidth: 0,
    backgroundColor: colors.primary,
  },
  headerBackTitleStyle: {
    color: colors.black,
  },
}

export type RootStackParamList = {
  Landing: undefined
  LegalDisclaimer: undefined
  NewPassword: undefined
  ShowPaperKey: undefined
  WalletScan: undefined
  Main: undefined
  Overview: undefined
  Settings: undefined
  SettingsGrinNode: undefined
  SettingsCurrency: undefined
  ViewPaperKey: { fromSettings: boolean }
  VerifyPaperKey: { title: string }
  TxDetails: undefined
  ReceiveInfo: undefined
  ReceiveGuide: undefined
  ReceiveGuideSend: undefined
  Send: undefined
  Receive: undefined
  ScanQRCode: undefined
  Password: undefined
  Created: undefined
  NotCreated: undefined
}

const Stack = createStackNavigator<RootStackParamList>()

const NotCreated = () => (
  <Stack.Navigator initialRouteName="Landing" screenOptions={defaultScreenOptions}>
    <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
    <Stack.Screen
      name="LegalDisclaimer"
      component={LegalDisclaimerScreen}
      options={{
        title: 'Welcome',
        headerBackTitle: '',
      }}
    />
    <Stack.Screen
      name="NewPassword"
      component={NewPasswordScreen}
      options={{
        title: 'Password',
        headerBackTitle: '',
      }}
    />
    <Stack.Screen name="ShowPaperKey" component={ShowPaperKeyScreen} />
    <Stack.Screen
      name="VerifyPaperKey"
      component={VerifyPaperKeyScreen}
      options={({ route }) => ({
        title: `${route.params?.title}`,
      })}
    />
    <Stack.Screen name="WalletScan" component={WalletScanScreen} />
  </Stack.Navigator>
)

const ReceiveInfoStack = () => (
  <Stack.Navigator
    initialRouteName="ReceiveInfo"
    screenOptions={defaultScreenOptions}
    headerMode="none">
    <Stack.Screen name="ReceiveInfo" component={ReceiveInfoScreen} />
    <Stack.Screen name="ReceiveGuide" component={ReceiveGuideScreen} />
  </Stack.Navigator>
)

const SettingsStack = () => (
  <Stack.Navigator
    initialRouteName="Settings"
    headerMode="none"
    screenOptions={{ ...defaultScreenOptions, headerBackTitle: 'Back' }}>
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="SettingsGrinNode" component={SettingsGrinNodeScreen} />
    <Stack.Screen name="SettingsCurrency" component={SettingsCurrencyScreen} />
    <Stack.Screen
      name="ViewPaperKey"
      component={ShowPaperKeyScreen}
      initialParams={{ fromSettings: true }}
    />
  </Stack.Navigator>
)

const Created = () => (
  <Stack.Navigator initialRouteName="Overview" screenOptions={defaultScreenOptions}>
    <Stack.Screen name="Settings" component={SettingsStack} />
    <Stack.Screen name="TxDetails" component={TxDetailsScreen} />
    <Stack.Screen name="Overview" component={OverviewScreen} />
    <Stack.Screen name="ReceiveInfo" component={ReceiveInfoStack} />
    <Stack.Screen name="Send" component={SendScreen} />
    <Stack.Screen name="Receive" component={ReceiveScreen} />
    <Stack.Screen name="ScanQRCode" component={ScanQRCodeScreen} />
  </Stack.Navigator>
)

export function RootStack({ ref, walletCreated }: { ref: any; walletCreated: boolean }) {
  return (
    <NavigationContainer ref={ref}>
      <Stack.Navigator headerMode="none">
        {walletCreated ? (
          <Stack.Screen name="Created" component={Created} />
        ) : (
          <Stack.Screen name="NotCreated" component={NotCreated} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
