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
import { Linking, AppState } from 'react-native'
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation'
import Toaster from 'react-native-toaster'
import { Provider, connect } from 'react-redux'
import {
  isResponseSlate,
  checkSlatesDirectory,
  checkApplicationSupportDirectory,
  checkApiSecret,
  isWalletInitialized,
} from 'common'

import { type State as GlobalState } from 'common/types'
import { store } from 'common/redux'

import OverviewScreen from 'screens/Overview'
import SendScreen from 'screens/Send/main'
import ReceiveFinalizeScreen from 'screens/ReceiveFinalize'
import SettingsScreen from 'screens/Settings'
import TxDetailsScreen from 'screens/TxDetails'
import LandingScreen from 'screens/Landing'
import InitialScreen from 'screens/Initial'
import MnemonicScreen from 'screens/Mnemonic'
import RecoveryScreen from 'screens/Recovery/main'
import TopupScreen from 'screens/Topup'
import PasswordScreen from 'screens/Password'
import WalletNewScreen from 'screens/WalletNew/main'
import RecoveryInProgressScreen from 'screens/RecoveryInProgress'

// Filesystem
checkSlatesDirectory()
checkApplicationSupportDirectory()
checkApiSecret()

const MainStack = createStackNavigator(
  {
    Settings: SettingsScreen,
    Overview: OverviewScreen,
    TxDetails: TxDetailsScreen,
  },
  {
    initialRouteName: 'Overview',
  }
)

const AppStack = createStackNavigator(
  {
    Main: MainStack,
    Send: SendScreen,
    Topup: TopupScreen,
    Receive: {
      screen: ReceiveFinalizeScreen,
    },
    Finalize: {
      screen: ReceiveFinalizeScreen,
    },
    ShowMnemonic: MnemonicScreen,
  },
  {
    initialRouteName: 'Main',
    mode: 'modal',
    headerMode: 'none',
  }
)

const WalletNewStack = createStackNavigator(
  {
    CreatePassword: WalletNewScreen,
    Mnemonic: MnemonicScreen,
  },
  {
    initialRouteName: 'CreatePassword',
    headerMode: 'none',
  }
)

const WalletRecoveryStack = createStackNavigator(
  {
    Recovery: RecoveryScreen,
    RecoveryInProgress: RecoveryInProgressScreen,
  },
  {
    initialRouteName: 'Recovery',
    headerMode: 'none',
  }
)

const WalletCreateStack = createStackNavigator(
  {
    Landing: LandingScreen,
    WalletNew: WalletNewStack,
    WalletRecovery: WalletRecoveryStack,
  },
  {
    headerMode: 'none',
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
    headerMode: 'none',
  }
)
type Props = {
  toastMessage: {
    text: string,
    styles: any,
  },
}
type State = {}

const AppContainer = createAppContainer(RootStack)

class RealApp extends React.Component<Props, State> {
  navigation: any
  componentDidMount() {
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          this._handleOpenURL({ url })
        }
      })
      .catch(err => console.error('An error occurred', err))
    Linking.addEventListener('url', this._handleOpenURL)
    AppState.addEventListener('change', this._handleAppStateChange)
  }
  componentWillUnmount() {
    Linking.removeEventListener('url', this._handleOpenURL)
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _handleOpenURL = event => {
    const slatePath = decodeURIComponent(event.url).substr(7)
    isWalletInitialized().then(exists => {
      if (exists) {
        const nextScreen = {
          name: isResponseSlate(slatePath) ? 'Finalize' : 'Receive',
          params: { slatePath },
        }
        if (!store.getState().wallet.password.value) {
          //Password is not set
          this.navigation.navigate('Password', { nextScreen })
        } else {
          this.navigation.navigate(nextScreen.name, nextScreen.params)
        }
      }
    })
  }

  _handleAppStateChange = nextAppState => {
    if (nextAppState === 'background') {
      isWalletInitialized().then(exists => {
        if (exists) {
          this.navigation.navigate('Password', { nextScreen: { name: 'Main' } })
          store.dispatch({ type: 'CLEAR_PASSWORD' })
        }
      })
    }
  }
  render() {
    return (
      <React.Fragment>
        <Toaster message={this.props.toastMessage} />
        <AppContainer
          ref={nav => {
            if (nav && nav._navigation) {
              this.navigation = nav._navigation
            }
          }}
        />
      </React.Fragment>
    )
  }
}
const RealAppConnected = connect(
  (state: GlobalState) => {
    return {
      toastMessage: state.toaster,
    }
  },
  null
)(RealApp)

export default class App extends Component<{}, {}> {
  render() {
    return (
      <Provider store={store}>
        <RealAppConnected />
      </Provider>
    )
  }
}
