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

import styled from 'styled-components/native'
import FeatherIcon from 'react-native-vector-icons/Feather'
import sleep from 'sleep-promise'
import { isAndroid } from 'src/common'
import { State as ReduxState, Tx } from 'src/common/types'
import React from 'react'
import { Text, Animated, TouchableOpacity } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  TransitionPresets,
  createStackNavigator,
} from '@react-navigation/stack'
import { NavigationContainerRef } from '@react-navigation/core'
import OverviewScreen from 'src/screens/Overview'
import SettingsScreen from 'src/screens/Settings'
import TxDetailsScreen from 'src/screens/TxDetails'
import TxIncompleteSendScreen, {
  androidHeaderTitle as TxIncompleteSendAndroidHeaderTitle,
} from 'src/screens/TxIncompleteSend/TxIncompleteSend'
import TxIncompleteReceiveScreen from 'src/screens/TxIncompleteReceive/TxIncompleteReceive'
import LandingScreen from 'src/screens/Landing'
import ShowPaperKeyScreen from 'src/screens/PaperKey/Show'
import VerifyPaperKeyScreen from 'src/screens/PaperKey/Verify'
import PasswordScreen from 'src/screens/Password'
import NewPasswordScreen from 'src/screens/NewPassword'
import WalletScanScreen from 'src/screens/WalletScan'
import SettingsGrinNodeScreen from 'src/screens/Settings/GrinNode'
import SettingsCurrencyScreen from 'src/screens/Settings/Currency'
import LegalDisclaimerScreen from 'src/screens/LegalDisclaimer'
import LicensesScreen from 'src/screens/Licenses'
import LicenseScreen from 'src/screens/License'
import ShowQRCodeScreen from 'src/screens/ShowQRCode'
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
  headerTintColor: colors.onBackground,
  headerTitleStyle: {
    color: colors.onBackground,
  },
  headerStyle: {},
  headerBackTitleStyle: {
    color: colors.onBackground,
  },
  cardOverlayEnabled: true,
}

export enum passwordScreenMode {
  APP_LOCK = 'app_lock', // open wallet
  PAPER_KEY = 'paper_key', // get mnemonic
  ENABLE_BIOMETRY = 'enable_biometry',
  PROTECT_SCREEN = 'protect_screen', // just protect screen with PIN
}

export type RootStackParamList = {
  Landing: undefined
  LegalDisclaimer: {
    nextScreen: {
      name: keyof RootStackParamList
      params: Record<string, unknown>
    }
  }
  NewPassword: {
    isNew: boolean
  }
  WalletScan: undefined
  Main: undefined
  Overview: { slatePath: string }
  Settings: undefined
  SettingsGrinNode: undefined | { apiSecret: string }
  Licenses: undefined
  License: { licenseText: string }
  ShowQRCode: {
    title?: string

    label: string
    content: string
  }
  ScanQRCode: {
    title?: string
    label: string
    nextScreen: keyof RootStackParamList
  }
  SettingsCurrency: undefined
  ViewPaperKey: { fromSettings: boolean; mnemonic: string; password?: string }
  VerifyPaperKey: {
    title: string
    wordsCount: number
    password: string
    mnemonic?: string
  }
  TxDetails: { txId: number }
  TxIncompleteSend:
    | undefined
    | {
        tx?: Tx
        title?: string
        subTitle?: string
        slatepack?: string
        qrContent?: string
      }
  TxIncompleteReceive:
    | undefined
    | { slatepack?: string; tx?: Tx; title?: string; qrContent?: string }
  Receive: { slatePath: string; slate: string }
  Password: { mode: passwordScreenMode }
  Created: undefined
  NotCreated: undefined
  HomeTabs: undefined
}

const Stack = createStackNavigator<RootStackParamList>()

const NotCreated = () => (
  <Stack.Navigator
    initialRouteName="Landing"
    screenOptions={defaultScreenOptions}>
    <Stack.Screen
      name="Landing"
      component={LandingScreen}
      options={{ headerShown: false }}
    />
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
    <Stack.Screen
      name="ViewPaperKey"
      initialParams={{ fromSettings: false }}
      component={ShowPaperKeyScreen}
      options={{
        title: 'Paper Key',
        headerBackTitle: '',
      }}
    />
    <Stack.Screen
      name="VerifyPaperKey"
      component={VerifyPaperKeyScreen}
      options={({ route }) => ({
        title: route.params?.title,
      })}
    />
  </Stack.Navigator>
)

const forFade = ({
  current,
}: {
  current: { progress: Animated.AnimatedInterpolation }
}) => ({
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

const SettingsStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Settings"
      screenOptions={{ ...defaultScreenOptions, headerBackTitle: '' }}>
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
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
          title: 'Base Currency',
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
        name="Licenses"
        options={{
          title: 'Open Source',
        }}
        component={LicensesScreen}
      />
      <Stack.Screen name="License" component={LicenseScreen} />
      <Stack.Screen name="Password" component={PasswordScreen} />
    </Stack.Navigator>
  )
}

const Tab = createBottomTabNavigator()

const HomeTabs = () => (
  <Tab.Navigator
    initialRouteName="Overview"
    tabBarOptions={{
      activeTintColor: colors.secondary,
      inactiveTintColor: colors.onSurfaceLight,
    }}>
    <Tab.Screen
      name="Overview"
      component={OverviewScreen}
      options={{
        tabBarIcon: ({ color, size }) => {
          return <FeatherIcon name="list" size={size + 4} color={color} />
        },
        tabBarButton: ({ children }) => {
          return (
            <TouchableOpacity
              testID="OverviewTab"
              style={{ flex: 1 }}
              onPress={() => {
                getNavigation().then((navigation) => {
                  navigation.navigate('Overview')
                })
              }}>
              {children}
            </TouchableOpacity>
          )
        },
      }}
    />
    <Tab.Screen
      name="Send"
      component={TxIncompleteSendScreen}
      options={{
        tabBarIcon: ({ color, size }) => {
          return (
            <FeatherIcon name="arrow-up-circle" size={size} color={color} />
          )
        },
        tabBarButton: ({ children }) => {
          return (
            <TouchableOpacity
              testID="SendTab"
              style={{ flex: 1 }}
              onPress={() => {
                getNavigation().then((navigation) => {
                  navigation.navigate('TxIncompleteSend')
                })
              }}>
              {children}
            </TouchableOpacity>
          )
        },
      }}
    />
    <Tab.Screen
      name="Receive"
      component={TxIncompleteReceiveScreen}
      options={{
        tabBarIcon: ({ color, size }) => {
          return (
            <FeatherIcon name="arrow-down-circle" size={size} color={color} />
          )
        },
        tabBarButton: ({ children }) => {
          return (
            <TouchableOpacity
              testID="ReceiveTab"
              style={{ flex: 1 }}
              onPress={() => {
                getNavigation().then((navigation) => {
                  navigation.navigate('TxIncompleteReceive')
                })
              }}>
              {children}
            </TouchableOpacity>
          )
        },
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsStack}
      options={{
        tabBarIcon: ({ color, size }) => {
          return <FeatherIcon name="settings" size={size} color={color} />
        },
        tabBarButton: ({ children }) => {
          return (
            <TouchableOpacity
              testID="SettingsTab"
              style={{ flex: 1 }}
              onPress={() => {
                getNavigation().then((navigation) => {
                  navigation.navigate('Settings')
                })
              }}>
              {children}
            </TouchableOpacity>
          )
        },
      }}
    />
  </Tab.Navigator>
)

const Created = () => (
  <Stack.Navigator
    initialRouteName="HomeTabs"
    screenOptions={defaultScreenOptions}>
    <Stack.Screen
      name="TxDetails"
      component={TxDetailsScreen}
      options={
        isAndroid
          ? {
              ...TransitionPresets.DefaultTransition,
              title: 'Transaction Details',
            }
          : { ...TransitionPresets.ModalPresentationIOS, headerShown: false }
      }
    />
    <Stack.Screen
      name="TxIncompleteSend"
      component={TxIncompleteSendScreen}
      options={
        isAndroid
          ? ({ route }) => ({
              ...TransitionPresets.DefaultTransition,
              headerTitle: () =>
                TxIncompleteSendAndroidHeaderTitle(route?.params),
            })
          : { ...TransitionPresets.ModalPresentationIOS, headerShown: false }
      }
    />
    <Stack.Screen
      name="TxIncompleteReceive"
      component={TxIncompleteReceiveScreen}
      options={
        isAndroid
          ? ({ route }) => ({
              ...TransitionPresets.DefaultTransition,
              title: route?.params?.title,
            })
          : { ...TransitionPresets.ModalPresentationIOS, headerShown: false }
      }
    />
    <Stack.Screen
      name="ShowQRCode"
      component={ShowQRCodeScreen}
      options={
        isAndroid
          ? ({ route }) => ({
              ...TransitionPresets.DefaultTransition,
              headerTitle: () =>
                TxIncompleteSendAndroidHeaderTitle({
                  title: route?.params?.label,
                }),
            })
          : { ...TransitionPresets.ModalPresentationIOS, headerShown: false }
      }
    />
    <Stack.Screen
      name="ScanQRCode"
      component={ScanQRCodeScreen}
      options={
        isAndroid
          ? ({ route }) => ({
              ...TransitionPresets.DefaultTransition,
              headerTitle: () =>
                TxIncompleteSendAndroidHeaderTitle({
                  title: route?.params?.label,
                }),
            })
          : { ...TransitionPresets.ModalPresentationIOS, headerShown: false }
      }
    />
    <Stack.Screen
      name="HomeTabs"
      component={HomeTabs}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
)

export function RootStack({
  walletCreated,
  isWalletOpened,
  scanInProgress,
}: {
  walletCreated: boolean
  isWalletOpened: boolean
  scanInProgress: boolean
}) {
  return (
    <Stack.Navigator
      headerMode="none"
      screenOptions={{
        cardStyleInterpolator: forFade,
        headerShown: false,
        cardStyle: { backgroundColor: 'black' },
      }}>
      {walletCreated ? (
        isWalletOpened ? (
          scanInProgress ? (
            <Stack.Screen name="WalletScan" component={WalletScanScreen} />
          ) : (
            <Stack.Screen name="Created" component={Created} />
          )
        ) : (
          <Stack.Screen
            name="Password"
            component={PasswordScreen}
            initialParams={{ mode: passwordScreenMode.APP_LOCK }}
            options={{
              headerShown: false,
            }}
          />
        )
      ) : (
        <Stack.Screen name="NotCreated" component={NotCreated} />
      )}
    </Stack.Navigator>
  )
}

export const navigationRef = React.createRef<NavigationContainerRef>()

export const getNavigation = async (): Promise<NavigationContainerRef> => {
  let retries = 0
  while (!navigationRef.current && retries < 3) {
    await sleep(200)
    retries++
  }
  if (!navigationRef.current) {
    throw new Error('this.navigation.current is undefined')
  }
  return navigationRef.current
}
