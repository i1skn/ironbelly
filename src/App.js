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
import {
  NativeModules,
  BackHandler,
  Linking,
  AppState,
  StatusBar,
  PermissionsAndroid,
} from 'react-native'
import { Provider, connect } from 'react-redux'
import {
  isResponseSlate,
  SLATES_DIRECTORY,
  checkSlatesDirectory,
  checkApplicationSupportDirectory,
  checkApiSecret,
  isWalletInitialized,
  parseSendLink,
} from 'common'
import urlParser from 'url'
import Modal from 'react-native-modal'
import { PersistGate } from 'redux-persist/integration/react'
import Toast from 'react-native-easy-toast'
import { isIphoneX } from 'react-native-iphone-x-helper'
import RNFS from 'react-native-fs'

import { type Dispatch, type State as GlobalState } from 'common/types'
import { store, persistor } from 'common/redux'
import TxPostConfirmationModal from 'components/TxPostConfirmationModal'
import { AppContainer } from 'modules/navigation'
import { isAndroid } from 'common'

import { type NavigationState, NavigationActions } from 'react-navigation'
import { MAINNET_CHAIN, MAINNET_API_SECRET, FLOONET_API_SECRET } from 'modules/settings'
import { type State as ToasterState } from 'modules/toaster'
import { type State as CurrencyRatesState } from 'modules/currency-rates'

// Filesystem
checkSlatesDirectory()
checkApplicationSupportDirectory()

type Props = {
  toastMessage: ToasterState,
  nav: NavigationState,
  showTxConfirmationModal: boolean,
  closeTxPostModal: () => void,
  clearToast: () => void,
  setApiSecret: (apiSecret: string) => void,
  chain: string,
  dispatch: Dispatch,
  scanInProgress: boolean,
  currencyRates: CurrencyRatesState,
  setFromLink: (amount: number, message: string, url: string) => void,
  requestCurrencyRates: () => void,
  sharingInProgress: boolean,
  slateUrl: ?string,
}
type State = {}

class RealApp extends React.Component<Props, State> {
  navigation: any
  backHandler: any
  componentDidMount() {
    StatusBar.setBarStyle('dark-content')
    const { slateUrl } = this.props
    if (slateUrl) {
      this._handleOpenURL({ url: slateUrl })
    } else {
      Linking.getInitialURL()
        .then(url => {
          if (url) {
            this._handleOpenURL({ url })
          }
        })
        .catch(err => console.error('An error occurred', err))
    }
    Linking.addEventListener('url', this._handleOpenURL)
    AppState.addEventListener('change', this._handleAppStateChange)
    checkApiSecret(() => {
      this.props.setApiSecret(
        this.props.chain === MAINNET_CHAIN ? MAINNET_API_SECRET : FLOONET_API_SECRET
      )
    })
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this._handleBackPress)
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this._handleOpenURL)
    AppState.removeEventListener('change', this._handleAppStateChange)
    this.backHandler.remove()
  }

  _handleOpenURL = event => {
    const { setFromLink } = this.props
    isWalletInitialized().then(async exists => {
      if (exists) {
        if (isAndroid) {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              {
                title: 'Storage access',
                message: 'Ironbelly needs to save and open slate files.',
                buttonNegative: 'Decline',
                buttonPositive: 'Accept',
              }
            )
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              return
            }
          } catch (err) {
            console.warn(err)
            return
          }
        }

        const link = urlParser.parse(event.url, true)
        let nextScreen
        if (link.protocol === 'grin:') {
          if (link.host === 'send') {
            const { amount, destination, message } = parseSendLink(link.query)
            if (!isNaN(amount) && destination) {
              setFromLink(amount, message, destination)
              nextScreen = {
                name: 'Send',
                params: {},
              }
            }
          }
        } else if (['file:'].indexOf(link.protocol) !== -1 && link.path) {
          const path = isAndroid ? decodeURIComponent(link.path) : link.path
          nextScreen = isResponseSlate(link.path)
            ? {
                name: 'Overview',
                params: { responseSlatePath: path },
              }
            : {
                name: 'Receive',
                params: { slatePath: path },
              }
        } else if (['content:'].indexOf(link.protocol) !== -1) {
          // Copy the file, because we can not operate on content://
          // from inside rust code
          const url = event.url
          const fileName = url
            .split('/')
            .pop()
            .split('%2F')
            .pop()
          const destPath = `${SLATES_DIRECTORY}/${fileName}`
          await RNFS.copyFile(url, destPath)
          nextScreen = isResponseSlate(link.href)
            ? {
                name: 'Overview',
                params: { responseSlatePath: destPath },
              }
            : {
                name: 'Receive',
                params: { slatePath: destPath },
              }
        }
        if (nextScreen) {
          if (!store.getState().wallet.password.value) {
            //Password is not set
            this.props.dispatch(
              NavigationActions.navigate({ routeName: 'Password', params: { nextScreen } })
            )
          } else {
            this.props.dispatch(
              NavigationActions.navigate({ routeName: nextScreen.name, params: nextScreen.params })
            )
          }
        }
      }
    })
  }

  _handleAppStateChange = nextAppState => {
    const { scanInProgress, sharingInProgress } = this.props
    if (nextAppState === 'background' && !sharingInProgress) {
      isWalletInitialized().then(exists => {
        if (exists) {
          this.props.dispatch(
            NavigationActions.navigate({
              routeName: 'Password',
              params: {
                nextScreen: scanInProgress
                  ? {
                      name: 'WalletScan',
                    }
                  : { name: 'Main' },
              },
            })
          )
          this.props.dispatch({ type: 'CLEAR_PASSWORD' })
        }
      })
    }
  }

  shouldCloseApp(currentRoute: NavigationState) {
    return ['Overview', 'Landing', 'Password'].indexOf(currentRoute.routeName) !== -1
  }

  getCurrentRoute(state: NavigationState) {
    let route = state
    while (route.hasOwnProperty('index')) {
      route = route.routes[route.index]
    }
    return route
  }

  _handleBackPress = () => {
    const { dispatch, nav } = this.props
    if (this.shouldCloseApp(this.getCurrentRoute(nav))) return false
    dispatch(NavigationActions.back())
    return true
  }

  componentDidUpdate(prevProps) {
    if (prevProps.toastMessage.text !== this.props.toastMessage.text) {
      if (this.props.toastMessage.text) {
        this.refs.toast.timer && clearTimeout(this.refs.toast.timer)
        this.refs.toast.show(this.props.toastMessage.text, this.props.toastMessage.duration, () => {
          this.props.clearToast()
        })
      } else {
        if (this.refs.toast.state.isShow) {
          this.refs.toast.setState({ isShow: false })
        }
      }
    }

    const sinceLastCurrencyRatesUpdate = Date.now() - this.props.currencyRates.lastUpdated
    if (sinceLastCurrencyRatesUpdate > 5 * 60 * 1000 && !this.props.currencyRates.inProgress) {
      this.props.requestCurrencyRates()
    }
  }

  render() {
    const { dispatch, closeTxPostModal } = this.props
    return (
      <React.Fragment>
        <Modal isVisible={this.props.showTxConfirmationModal} onBackdropPress={closeTxPostModal}>
          <TxPostConfirmationModal />
        </Modal>
        <AppContainer state={this.props.nav} dispatch={dispatch} />
        <Toast ref="toast" position={'top'} positionValue={isIphoneX() ? 75 : 55} />
      </React.Fragment>
    )
  }
}
const RealAppConnected = connect(
  (state: GlobalState) => ({
    nav: state.nav,
    toastMessage: state.toaster,
    showTxConfirmationModal: state.tx.txPost.showModal,
    chain: state.settings.chain,
    scanInProgress: state.wallet.walletScan.inProgress,
    currencyRates: state.currencyRates,
    sharingInProgress: state.tx.slateShare.inProgress,
  }),
  (dispatch, ownProps) => ({
    closeTxPostModal: () => dispatch({ type: 'TX_POST_CLOSE' }),
    setApiSecret: apiSecret => {
      dispatch({ type: 'SET_API_SECRET', apiSecret })
    },
    clearToast: () => dispatch({ type: 'TOAST_CLEAR' }),
    dispatch,
    setFromLink: (amount, message, url) =>
      dispatch({
        type: 'TX_FORM_SET_FROM_LINK',
        amount,
        textAmount: amount.toString(),
        message,
        url,
      }),
    requestCurrencyRates: () =>
      dispatch({
        type: 'CURRENCY_RATES_REQUEST',
      }),
  })
)(RealApp)

export default class App extends Component<{ url: string }, {}> {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RealAppConnected slateUrl={this.props.url} />
        </PersistGate>
      </Provider>
    )
  }
}
