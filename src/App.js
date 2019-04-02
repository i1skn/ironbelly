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
import urlParser from 'url'
import Modal from 'react-native-modal'
import { decode as atob } from 'base-64'

import { type State as GlobalState, type Url } from 'common/types'
import { store } from 'common/redux'
import TxPostConfirmationModal from 'components/TxPostConfirmationModal'
import { appFont } from 'components/CustomFont'

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

// Filesystem
checkSlatesDirectory()
checkApplicationSupportDirectory()
checkApiSecret()

const MainStack = createStackNavigator(
  {
    Settings: SettingsScreen,
    Overview: {
      screen: OverviewScreen,
      params: {},
    },
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
    SendLink: SendLinkScreen,
    Topup: TopupScreen,
    Receive: ReceiveScreen,
    // ShowPaperKey: ShowPaperKeyScreen,
  },
  {
    initialRouteName: 'Main',
    mode: 'modal',
    headerMode: 'none',
    defaultNavigationOptions: {},
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
    defaultNavigationOptions: {
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
    },
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

type Props = {
  toastMessage: {
    text: string,
    styles: any,
  },
  showTxConfirmationModal: boolean,
  closeTxPostModal: () => void,
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
    isWalletInitialized().then(exists => {
      if (exists) {
        // $FlowFixMe
        const link: Url = urlParser.parse(event.url, true)
        let nextScreen
        if (link.protocol === 'grin:') {
          if (link.host === 'send') {
            const amount = parseFloat(link.query.amount)
            const destination = link.query.destination
            const message = atob(link.query.message)
            if (!isNaN(amount) && destination) {
              nextScreen = {
                name: 'SendLink',
                params: { amount, url: destination, message },
              }
            }
          }
        } else if (link.protocol === 'file:') {
          nextScreen = isResponseSlate(link.path)
            ? {
                name: 'Overview',
                params: { responseSlatePath: link.path },
              }
            : {
                name: 'Receive',
                params: { slatePath: link.path },
              }
        }
        if (nextScreen) {
          if (!store.getState().wallet.password.value) {
            //Password is not set
            this.navigation.navigate('Password', { nextScreen })
          } else {
            this.navigation.navigate(nextScreen.name, nextScreen.params)
          }
        }
      }
    })
  }

  _handleAppStateChange = nextAppState => {
    if (nextAppState === 'inactive') {
      isWalletInitialized().then(exists => {
        if (exists) {
          this.navigation.navigate('Password', { nextScreen: { name: 'Main' } })
          store.dispatch({ type: 'CLEAR_PASSWORD' })
        }
      })
    }
  }
  render() {
    const { closeTxPostModal } = this.props
    return (
      <React.Fragment>
        <Toaster message={this.props.toastMessage} />
        <Modal isVisible={this.props.showTxConfirmationModal} onBackdropPress={closeTxPostModal}>
          <TxPostConfirmationModal />
        </Modal>
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
      showTxConfirmationModal: state.tx.txPost.showModal,
    }
  },
  (dispatch, ownProps) => ({
    closeTxPostModal: () => dispatch({ type: 'TX_POST_CLOSE' }),
  })
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
