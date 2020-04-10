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
import styled from 'styled-components/native'
import { State as ReduxState } from 'src/common/types'
import React from 'react'
import { Text, Animated } from 'react-native'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack'
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
import { store } from 'src/common/redux'
import {
  MAINNET_CHAIN,
  FLOONET_CHAIN,
  MAINNET_API_SECRET,
  FLOONET_API_SECRET,
} from 'src/modules/settings'

const defaultScreenOptions = {
  headerTintColor: colors.black,
  headerTitleStyle: {
    // fontWeight: '600',
  },
  headerStyle: {
    backgroundColor: colors.primary,
    shadowRadius: 0,
    shadowOffset: {
      height: 0,
    },
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
  SettingsGrinNode: { apiSecret: string }
  SettingsCurrency: undefined
  ViewPaperKey: { fromSettings: boolean }
  VerifyPaperKey: { title: string }
  TxDetails: { txId: number }
  ReceiveInfo: undefined
  ReceiveGuide: { guide: string }
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
        title: route.params?.title,
      })}
    />
  </Stack.Navigator>
)

const forFade = ({ current }: { current: { progress: Animated.AnimatedInterpolation } }) => ({
  cardStyle: {
    opacity: current.progress,
  },
})

const ResetButton = styled.TouchableOpacity`
  padding-right: 16px;
`
const ResetButtonText = styled(Text)`
  font-size: 18px;
  font-weight: 500;
`

const Created = () => (
  <Stack.Navigator initialRouteName="Overview" screenOptions={defaultScreenOptions}>
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen
      name="SettingsGrinNode"
      component={SettingsGrinNodeScreen}
      options={({ navigation }) => {
        return {
          title: 'Grin node',
          headerRight: () => (
            <ResetButton
              onPress={() => {
                const state = store.getState() as ReduxState

                switch (state.settings.chain) {
                  case MAINNET_CHAIN:
                    store.dispatch({
                      type: 'SWITCH_TO_MAINNET',
                    })
                    navigation.setParams({
                      apiSecret: MAINNET_API_SECRET,
                    })
                    break

                  case FLOONET_CHAIN:
                    store.dispatch({
                      type: 'SWITCH_TO_FLOONET',
                    })
                    navigation.setParams({
                      apiSecret: FLOONET_API_SECRET,
                    })
                    break
                }
              }}>
              <ResetButtonText>Reset</ResetButtonText>
            </ResetButton>
          ),
        }
      }}
    />
    <Stack.Screen
      name="SettingsCurrency"
      component={SettingsCurrencyScreen}
      options={{
        title: 'Currency',
      }}
    />
    <Stack.Screen
      name="ReceiveInfo"
      component={ReceiveInfoScreen}
      options={{
        title: 'Receive',
      }}
    />
    <Stack.Screen
      name="ReceiveGuide"
      component={ReceiveGuideScreen}
      options={{
        title: 'Receive',
      }}
    />
    <Stack.Screen
      name="ViewPaperKey"
      component={ShowPaperKeyScreen}
      initialParams={{ fromSettings: true }}
      options={{
        title: 'Paper key',
      }}
    />
    <Stack.Screen
      name="TxDetails"
      component={TxDetailsScreen}
      options={{
        ...TransitionPresets.ModalPresentationIOS,
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Overview"
      component={OverviewScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen name="Send" component={SendScreen} />
    <Stack.Screen name="Receive" component={ReceiveScreen} />
    <Stack.Screen
      name="ScanQRCode"
      component={ScanQRCodeScreen}
      options={{
        headerShown: false,
        gestureDirection: 'horizontal-inverted',
      }}
    />
  </Stack.Navigator>
)

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fff',
  },
}

export function RootStack({
  ref,
  walletCreated,
  isPasswordValid,
  scanInProgress,
}: {
  ref: any
  walletCreated: boolean
  isPasswordValid: boolean
  scanInProgress: boolean
}) {
  return (
    <NavigationContainer ref={ref} theme={appTheme}>
      <Stack.Navigator
        headerMode="none"
        screenOptions={{
          cardStyleInterpolator: forFade,
          headerShown: false,
          cardStyle: { backgroundColor: 'black' },
        }}>
        {walletCreated ? (
          isPasswordValid ? (
            scanInProgress ? (
              <Stack.Screen name="WalletScan" component={WalletScanScreen} />
            ) : (
              <Stack.Screen name="Created" component={Created} />
            )
          ) : (
            <Stack.Screen
              name="Password"
              component={PasswordScreen}
              options={{
                headerShown: false,
              }}
            />
          )
        ) : (
          <Stack.Screen name="NotCreated" component={NotCreated} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
