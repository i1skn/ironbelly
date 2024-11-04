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

import React, {useEffect} from 'react';
import SplashScreen from 'react-native-splash-screen';
import BackgroundTimer from 'react-native-background-timer';
import {ThemeProvider} from 'styled-components';
import {
  NavigationContainer,
  Theme as RNNavigationTheme,
} from '@react-navigation/native';
import {
  AppState,
  StatusBar,
  AppStateStatus,
  LogBox,
  ColorSchemeName,
} from 'react-native';
import WalletBridge from 'src/bridges/wallet';
import {Provider, connect} from 'react-redux';
import {
  checkSlatesDirectory,
  checkApplicationSupportDirectory,
} from 'src/common';
import Modal from 'react-native-modal';
import {PersistGate} from 'redux-persist/integration/react';
import Toast from 'react-native-easy-toast';
import {isIphoneX} from 'react-native-iphone-x-helper';
import {Dispatch} from 'src/common/types';
import {RootState} from 'src/common/redux';
import {store, persistor} from 'src/common/redux';
import TxPostConfirmationModal from 'src/components/TxPostConfirmationModal';
import {RootStack, navigationRef} from 'src/modules/navigation';
import {isAndroid} from 'src/common';
import {State as ToasterState} from 'src/modules/toaster';
import {State as CurrencyRatesState} from 'src/modules/currency-rates';
import {styleSheetFactory, Theme, useThemedStyles} from './themes';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {SafeAreaProvider} from 'react-native-safe-area-context';

checkSlatesDirectory();
checkApplicationSupportDirectory();

LogBox.ignoreLogs([
  'Expected style',
  'useNativeDriver',
  'currentlyFocusedField',
  'new NativeEventEmitter',
  'EventEmitter.removeListener',
]);

interface StateProps {
  toastMessage: ToasterState;
  showTxConfirmationModal: boolean;
  chain: string;
  scanInProgress: boolean;
  currencyRates: CurrencyRatesState;
  walletCreated: boolean | null;
  isWalletOpened: boolean;
  lockInBackground: boolean;
}

interface DispatchProps {
  closeTxPostModal: () => void;
  clearToast: () => void;
  setApiSecret: (apiSecret: string) => void;
  requestCurrencyRates: () => void;
  setFromLink: (amount: number, message: string, url: string) => void;
  requestWalletExists: () => void;
}

interface OwnProps {
  dispatch: Dispatch;
}

type Props = StateProps &
  DispatchProps &
  OwnProps & {
    theme: RNNavigationTheme;
  };

type State = {
  walletCreated?: boolean;
};

class RealApp extends React.Component<Props, State> {
  lockTimeout: number | null = null;
  navigation = React.createRef();
  toast = React.createRef<Toast>();

  async componentDidMount() {
    if (isAndroid) {
      StatusBar.setBackgroundColor('rgba(0,0,0,0)');
      StatusBar.setTranslucent(true);
    }

    AppState.addEventListener('change', this._handleAppStateChange);
    this.props.requestWalletExists();
    SplashScreen.hide();
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && this.lockTimeout) {
      BackgroundTimer.clearTimeout(this.lockTimeout);
      this.lockTimeout = null;
    }
    if (this.props.lockInBackground && nextAppState === 'background') {
      WalletBridge.isWalletCreated().then(async exists => {
        if (exists) {
          if (isAndroid) {
            // TODO: make this configurable for both platforms
            this.lockTimeout = BackgroundTimer.setTimeout(() => {
              this.lockApp();
            }, 5000);
          } else {
            this.lockApp();
          }
        }
      });
    }
  };

  lockApp = () => {
    store.dispatch({
      type: 'CLOSE_WALLET',
    });
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.toastMessage.text !== this.props.toastMessage.text) {
      if (this.props.toastMessage.text) {
        this.toast.current?.timer && clearTimeout(this.toast.current?.timer);
        this.toast.current?.show(
          this.props.toastMessage.text,
          this.props.toastMessage.duration,
          () => {
            this.props.clearToast();
          },
        );
      } else {
        if (this.toast.current?.state.isShow) {
          this.toast.current?.setState({
            isShow: false,
          });
        }
      }
    }

    const sinceLastCurrencyRatesUpdate =
      Date.now() - this.props.currencyRates.lastUpdated;

    if (
      sinceLastCurrencyRatesUpdate > 5 * 60 * 1000 &&
      !this.props.currencyRates.inProgress &&
      !this.props.currencyRates.disabled
    ) {
      this.props.requestCurrencyRates();
    }
  }

  render() {
    const {
      walletCreated,
      scanInProgress,
      closeTxPostModal,
      isWalletOpened,
      theme,
    } = this.props;
    if (walletCreated === null) {
      return null;
    }
    return (
      <React.Fragment>
        <Modal
          isVisible={this.props.showTxConfirmationModal}
          onBackdropPress={closeTxPostModal}>
          <TxPostConfirmationModal />
        </Modal>
        <NavigationContainer ref={navigationRef} theme={theme}>
          <RootStack
            isWalletOpened={isWalletOpened}
            walletCreated={walletCreated}
            scanInProgress={scanInProgress}
          />
        </NavigationContainer>
        <Toast
          ref={this.toast}
          position={'top'}
          positionValue={isIphoneX() ? 75 : 55}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  return {
    toastMessage: state.toaster,
    showTxConfirmationModal: state.tx.txPost.showModal,
    chain: state.settings.chain,
    scanInProgress: state.wallet.walletScan.inProgress,
    isWalletOpened: state.wallet.isOpened,
    currencyRates: state.currencyRates,
    walletCreated: state.wallet.isCreated,
    lockInBackground: state.settings.lockInBackground,
  };
};

const RealAppConnected = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  RootState
>(mapStateToProps, dispatch => ({
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
    });
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
}))(RealApp);

function getNavigationTheme(
  theme: Theme,
  themeName: ColorSchemeName,
): RNNavigationTheme {
  return {
    dark: themeName === 'dark',
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.onBackground,
      border: theme.onBackground,
      notification: theme.warning,
    },
  };
}

const themedStyles = styleSheetFactory(() => ({}));

const App = () => {
  const [, theme, themeName] = useThemedStyles(themedStyles);

  useEffect(() => {
    changeNavigationBarColor(theme.surface, themeName === 'light', true);
    StatusBar.setBarStyle(
      themeName === 'light' ? 'dark-content' : 'light-content',
    );
  }, [themeName, theme]);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <SafeAreaProvider>
            <RealAppConnected
              dispatch={store.dispatch}
              theme={getNavigationTheme(theme, themeName as ColorSchemeName)}
            />
          </SafeAreaProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
