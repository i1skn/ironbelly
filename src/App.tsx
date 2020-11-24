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

import React, { Component } from 'react'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
// @ts-ignore
import {
  NativeModules,
  Linking,
  AppState,
  StatusBar,
  PermissionsAndroid,
  AppStateStatus,
  LogBox,
} from 'react-native'
import { Provider, connect } from 'react-redux'
import {
  SLATES_DIRECTORY,
  checkSlatesDirectory,
  checkApplicationSupportDirectory,
  isWalletInitialized,
} from 'src/common'
import urlParser from 'url'
import Modal from 'react-native-modal'
import { PersistGate } from 'redux-persist/integration/react'
// @ts-ignore
import Toast from 'react-native-easy-toast'
import { isIphoneX } from 'react-native-iphone-x-helper'
import RNFS from 'react-native-fs'
import { Dispatch, State as GlobalState } from 'src/common/types'
import { store, persistor } from 'src/common/redux'
import TxPostConfirmationModal from 'src/components/TxPostConfirmationModal'
import { RootStack, navigationRef } from 'src/modules/navigation'
import { isAndroid } from 'src/common'
import { State as ToasterState } from 'src/modules/toaster'
import { State as CurrencyRatesState } from 'src/modules/currency-rates'

const { GrinBridge } = NativeModules

checkSlatesDirectory()
checkApplicationSupportDirectory()

LogBox.ignoreLogs([
  'Expected style',
  'useNativeDriver',
  'currentlyFocusedField',
])

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fff',
  },
}

interface StateProps {
  toastMessage: ToasterState
  showTxConfirmationModal: boolean
  chain: string
  scanInProgress: boolean
  currencyRates: CurrencyRatesState
  sharingInProgress: boolean
  walletCreated: boolean | null
  isPasswordValid: boolean
}

interface DispatchProps {
  closeTxPostModal: () => void
  clearToast: () => void
  setApiSecret: (apiSecret: string) => void
  requestCurrencyRates: () => void
  setFromLink: (amount: number, message: string, url: string) => void
  requestWalletExists: () => void
}

interface OwnProps {
  dispatch: Dispatch
  slateUrl: string | undefined | null
}

type Props = StateProps & DispatchProps & OwnProps

type State = {
  walletCreated?: boolean
}

class RealApp extends React.Component<Props, State> {
  navigation: any

  constructor(props: Props) {
    super(props)
    this.navigation = React.createRef()
  }

  async componentDidMount() {
    StatusBar.setBarStyle('dark-content')
    if (isAndroid) {
      StatusBar.setBackgroundColor('rgba(0,0,0,0)')
      StatusBar.setTranslucent(true)
    }
    GrinBridge.setLogger().then(console.log).catch(console.log)
    const { slateUrl } = this.props

    if (slateUrl) {
      this._handleOpenURL({
        url: slateUrl,
      })
    } else {
      Linking.getInitialURL()
        .then((url) => {
          if (url) {
            this._handleOpenURL({
              url,
            })
          }
        })
        .catch((err) => console.error('An error occurred', err))
    }

    Linking.addEventListener('url', this._handleOpenURL)
    AppState.addEventListener('change', this._handleAppStateChange)
    // this.backHandler = BackHandler.addEventListener('hardwareBackPress', this._handleBackPress)
    this.props.requestWalletExists()
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this._handleOpenURL)
    AppState.removeEventListener('change', this._handleAppStateChange)
    // this.backHandler.remove()
  }

  _handleOpenURL = (event: { url: string }) => {
    // const { setFromLink } = this.props
    isWalletInitialized().then(async (exists) => {
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
              },
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

        if (link.protocol === 'grin:') {
          // if (link.host === 'send') {
          // const { amount, destination, message } = parseSendLink(link.query)
          // if (!isNaN(amount) && destination) {
          // setFromLink(amount, message, destination)
          // }
          // }
        } else if (
          link.protocol &&
          ['file:'].indexOf(link.protocol) !== -1 &&
          link.path
        ) {
          const path = isAndroid ? decodeURIComponent(link.path) : link.path
          store.dispatch({
            type: 'SLATE_LOAD_REQUEST',
            slatePath: path,
          })
        } else if (
          link.protocol &&
          ['content:'].indexOf(link.protocol) !== -1
        ) {
          // Copy the file, because we can not operate on content://
          // from inside rust code
          const url = event.url
          const fileName = url.split('/').pop()?.split('%2F').pop()
          const destPath = `${SLATES_DIRECTORY}/${fileName}`
          await RNFS.copyFile(url, destPath)
          store.dispatch({
            type: 'SLATE_LOAD_REQUEST',
            slatePath: destPath,
          })
        }
      }
    })
  }

  _handleAppStateChange = (nextAppState: AppStateStatus) => {
    const { sharingInProgress } = this.props

    if (nextAppState === 'background' && !sharingInProgress) {
      isWalletInitialized().then(async (exists) => {
        if (exists) {
          store.dispatch({
            type: 'CLEAR_PASSWORD',
          })
        }
      })
    }
  }

  // shouldCloseApp(currentRoute: Route<NavigationState['type']>) {
  // return ['Overview', 'Landing', 'Password'].indexOf(currentRoute.name) !== -1
  // }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.toastMessage.text !== this.props.toastMessage.text) {
      if (this.props.toastMessage.text) {
        // @ts-ignore
        this.refs.toast.timer && clearTimeout(this.refs.toast.timer)
        // @ts-ignore
        this.refs.toast.show(
          this.props.toastMessage.text,
          this.props.toastMessage.duration,
          () => {
            this.props.clearToast()
          },
        )
      } else {
        // @ts-ignore
        if (this.refs.toast.state.isShow) {
          // @ts-ignore
          this.refs.toast.setState({
            isShow: false,
          })
        }
      }
    }

    const sinceLastCurrencyRatesUpdate =
      Date.now() - this.props.currencyRates.lastUpdated

    if (
      sinceLastCurrencyRatesUpdate > 5 * 60 * 1000 &&
      !this.props.currencyRates.inProgress &&
      !this.props.currencyRates.disabled
    ) {
      this.props.requestCurrencyRates()
    }
  }

  render() {
    const {
      walletCreated,
      scanInProgress,
      closeTxPostModal,
      isPasswordValid,
    } = this.props
    if (walletCreated === null) {
      return null
    }
    return (
      <React.Fragment>
        <Modal
          isVisible={this.props.showTxConfirmationModal}
          onBackdropPress={closeTxPostModal}>
          <TxPostConfirmationModal />
        </Modal>
        <NavigationContainer ref={navigationRef} theme={appTheme}>
          <RootStack
            isPasswordValid={isPasswordValid}
            walletCreated={walletCreated}
            scanInProgress={scanInProgress}
          />
        </NavigationContainer>
        <Toast
          ref="toast"
          //  @ts-ignore
          position={'top'}
          positionValue={isIphoneX() ? 75 : 55}
        />
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: GlobalState): StateProps => {
  return {
    toastMessage: state.toaster,
    showTxConfirmationModal: state.tx.txPost.showModal,
    chain: state.settings.chain,
    scanInProgress: state.wallet.walletScan.inProgress,
    isPasswordValid: state.wallet.password.valid,
    currencyRates: state.currencyRates,
    sharingInProgress: state.tx.slateShare.inProgress,
    walletCreated: state.wallet.isCreated,
  }
}

const RealAppConnected = connect<StateProps, DispatchProps, {}, GlobalState>(
  mapStateToProps,
  (dispatch) => ({
    requestWalletExists: () =>
      dispatch({
        type: 'WALLET_EXISTS_REQUEST',
      }),
    closeTxPostModal: () =>
      dispatch({
        type: 'TX_POST_CLOSE',
      }),
    setApiSecret: (apiSecret: string) => {
      dispatch({
        type: 'SET_API_SECRET',
        apiSecret,
      })
    },
    clearToast: () =>
      dispatch({
        type: 'TOAST_CLEAR',
      }),
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
  }),
)(RealApp)

export default class App extends Component<
  {
    url: string
  },
  {}
> {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RealAppConnected
            slateUrl={this.props.url}
            dispatch={store.dispatch}
          />
        </PersistGate>
      </Provider>
    )
  }
}
