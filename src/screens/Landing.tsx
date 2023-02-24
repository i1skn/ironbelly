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

import React from 'react'
import {
  TouchableOpacity,
  Button as NativeButton,
  View,
  Platform,
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { connect } from 'react-redux'
import { Alert } from 'react-native'
import { State as SettingsState } from 'src/modules/settings'
import { FlexGrow, Spacer } from 'src/common'
import { Text, Button } from 'src/components/CustomFont'
import { RootState } from 'src/common/redux'
import { Error, Dispatch, NavigationProps } from 'src/common/types'
import {
  slightlyTransparent,
  styleSheetFactory,
  useThemedStyles,
} from 'src/themes'

type Props = {
  walletInit: () => void;
  switchToMainnet: () => void;
  switchToFloonet: () => void;
  error: Error | undefined | null;
  walletCreated: boolean;
  isFloonet: boolean;
  settings: SettingsState;
  legalAccepted: boolean;
} & NavigationProps<'Landing'>;

function Landing(props: Props) {
  const [styles] = useThemedStyles(themedStyles)
  const onVersionClick = () => {
    if (!props.isFloonet) {
      return Alert.alert(
        'Switch to Testnet',
        'Are you sure you want to switch to Testnet?',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'Switch',
            style: 'destructive',
            onPress: () => {
              props.switchToFloonet()
            },
          },
        ],
      )
    }
  }
  const onNewWallet = (isNew: boolean) => {
    return () => {
      const nextScreenName = 'NewPassword'
      const nextScreenParams = {
        isNew,
      }
      if (props.legalAccepted) {
        props.navigation.navigate(nextScreenName, nextScreenParams)
      } else {
        props.navigation.navigate('LegalDisclaimer', {
          nextScreen: {
            name: nextScreenName,
            params: nextScreenParams,
          },
        })
      }
    }
  }

  const { isFloonet, switchToMainnet } = props
  return (
    <View testID="LandingScreen" style={styles.wrapper}>
      <FlexGrow />
      <View>
        <Text style={styles.appTitle}>Ironbelly</Text>
        <Text style={styles.appSlogan}>Grin wallet you've deserved</Text>
      </View>

      <Button
        style={styles.actionButton}
        title="Create new wallet"
        testID="NewWalletButton"
        disabled={false}
        onPress={onNewWallet(true)}
      />
      <Button
        style={styles.actionButton}
        title="Restore from paper key"
        disabled={false}
        onPress={onNewWallet(false)}
      />
      <Spacer />
      {isFloonet && (
        <View style={styles.testnetDisclaimer}>
          <Text style={styles.testnetDisclaimerText}>
            This app is configured to use testnet
          </Text>
          <NativeButton
            title="Switch to mainnet"
            onPress={() => switchToMainnet()}
          />
        </View>
      )}
      <FlexGrow />
      <TouchableOpacity style={styles.version} onPress={onVersionClick}>
        <Text>
          Version: {DeviceInfo.getVersion()} build {DeviceInfo.getBuildNumber()}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const themedStyles = styleSheetFactory(theme => ({
  wrapper: {
    padding: 16,
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  actionButton: {
    marginBottom: 20,
    width: '100%',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.onBackground,
  },
  appSlogan: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 30,
    color: slightlyTransparent(theme.onBackground),
  },
  testnetDisclaimer: {
    width: '100%',
    alignItems: 'center',
  },
  testnetDisclaimerText: {
    textAlign: 'center',
    width: '100%',
  },
  version: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: Platform.select({ ios: 8, android: 40 }),
  },
}))

const mapStateToProps = (state: RootState) => ({
  settings: state.settings,
  isCreated: state.tx.txCreate.created,
  error: state.tx.txCreate.error,
  isFloonet: state.settings.chain === 'floonet',
  legalAccepted: state.app.legalAccepted,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  switchToMainnet: () => {
    dispatch({
      type: 'SWITCH_TO_MAINNET',
    })
  },
  switchToFloonet: () => {
    dispatch({
      type: 'SWITCH_TO_FLOONET',
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Landing)
