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
import { Image, View, Platform } from 'react-native'
import { connect } from 'react-redux'
import { State as SettingsState } from 'src/modules/settings'
import { FlexGrow, Spacer } from 'src/common'
import { Text, Button, Link } from 'src/components/CustomFont'
import { RootState } from 'src/common/redux'
import { Error, NavigationProps } from 'src/common/types'
import {
  slightlyTransparent,
  styleSheetFactory,
  useThemedStyles,
} from 'src/themes'

type Props = {
  walletInit: () => void;
  error: Error | undefined | null;
  walletCreated: boolean;
  settings: SettingsState;
  legalAccepted: boolean;
} & NavigationProps<'Landing'>;

function Landing(props: Props) {
  const [styles] = useThemedStyles(themedStyles)
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

  return (
    <View testID="LandingScreen" style={styles.wrapper}>
      <View style={{ flex: 3 }} />
      <View style={styles.title}>
        <Image
          source={require('src/assets/images/landing.png')}
          style={styles.image}
        />
        <Text style={styles.appTitle}>Ironbelly</Text>
        <Text style={styles.appSlogan}>Grin wallet you've deserved</Text>
      </View>
      <View style={{ flex: 2 }} />
      <Button
        style={styles.actionButton}
        title="Create a new wallet"
        testID="NewWalletButton"
        disabled={false}
        onPress={onNewWallet(true)}
      />
      <Button
        style={styles.actionButton}
        title="I already have a wallet"
        disabled={false}
        onPress={onNewWallet(false)}
        inverted
      />
      <View style={styles.tnc}>
        <Text style={styles.tncText}>By continuing, I agree to the </Text>
        <Link url={''} style={styles.tncText} title="Terms of Use" />
        <Text style={styles.tncText}> and consent to the </Text>
        <Link url={''} style={styles.tncText} title="Privacy Policy" />
        <Text style={styles.tncText}>.</Text>
      </View>
      <Spacer />
    </View>
  )
}

const themedStyles = styleSheetFactory(theme => ({
  wrapper: {
    padding: 16,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    marginBottom: 8,
    width: '100%',
  },
  image: {
    marginRight: 24,
  },
  title: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 44,
    fontWeight: '600',
    color: theme.onBackground,
    marginBottom: 8,
    marginTop: 24,
    textAlign: 'center',
  },
  appSlogan: {
    fontSize: 24,
    fontWeight: '500',
    color: slightlyTransparent(theme.onBackground),
    textAlign: 'center',
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
  versionText: {
    color: theme.onBackgroundLight,
  },
  tnc: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
  },
  tncText: {
    fontSize: 15,
    color: theme.onBackgroundLight,
  },
}))

const mapStateToProps = (state: RootState) => ({
  settings: state.settings,
  isCreated: state.tx.txCreate.created,
  error: state.tx.txCreate.error,
  legalAccepted: state.app.legalAccepted,
})

export default connect(mapStateToProps)(Landing)
