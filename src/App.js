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
import { Provider, connect } from 'react-redux'
import {
  isResponseSlate,
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

import { type Dispatch, type State as GlobalState, type Url } from 'common/types'
import { store, persistor } from 'common/redux'
import TxPostConfirmationModal from 'components/TxPostConfirmationModal'
import { AppContainer } from 'modules/navigation'
import { type NavigationState, NavigationActions } from 'react-navigation'
import { MAINNET_CHAIN, MAINNET_API_SECRET, FLOONET_API_SECRET } from 'modules/settings'
import { type State as ToasterState } from 'modules/toaster'

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
  recoveryStarted: boolean,
  setFromLink: (amount: number, message: string, url: string) => void,
}
type State = {}

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
    checkApiSecret(() => {
      this.props.setApiSecret(
        this.props.chain === MAINNET_CHAIN ? MAINNET_API_SECRET : FLOONET_API_SECRET
      )
    })
  }
  componentWillUnmount() {
    Linking.removeEventListener('url', this._handleOpenURL)
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _handleOpenURL = event => {
    const { setFromLink } = this.props
    isWalletInitialized().then(exists => {
      if (exists) {
        // $FlowFixMe
        const link: Url = urlParser.parse(event.url, true)
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
    const { recoveryStarted } = this.props
    if (nextAppState === 'background') {
      isWalletInitialized().then(exists => {
        if (exists) {
          this.props.dispatch(
            NavigationActions.navigate({
              routeName: 'Password',
              params: {
                nextScreen: recoveryStarted
                  ? {
                      name: 'WalletPrepare',
                      params: { isNew: false },
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
    recoveryStarted: state.wallet.walletInit.started,
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
  })
)(RealApp)

export default class App extends Component<{}, {}> {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <RealAppConnected />
        </PersistGate>
      </Provider>
    )
  }
}
