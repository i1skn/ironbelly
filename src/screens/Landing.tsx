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
import { TouchableOpacity, Button as NativeButton, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import { Alert } from 'react-native'
import { State as SettingsState } from 'src/modules/settings'
import { FlexGrow, Spacer } from 'src/common'
import colors from 'src/common/colors'
import { Text, Button } from 'src/components/CustomFont'
import { RootState } from 'src/common/redux'
import { Error, Dispatch, NavigationProps } from 'src/common/types'

const Wrapper = styled(View)`
  padding: 16px;
  flex-grow: 1;
  align-items: flex-start;
  justify-content: center;
`
const ActionButton = styled(Button)`
  margin-bottom: 20;
  width: 100%;
`
export const AppTitle = styled(Text)`
  font-size: 32;
  font-weight: 600;
`
export const AppSlogan = styled(Text)`
  font-size: 20;
  font-weight: 500;
  margin-bottom: 30;
  color: ${() => colors.grey[500]};
`
export const FloonetDisclaimer = styled.View`
  width: 100%;
  align-items: center;
`
type Props = {
  walletInit: () => void
  switchToMainnet: () => void
  switchToFloonet: () => void
  error: Error | undefined | null
  walletCreated: boolean
  isFloonet: boolean
  settings: SettingsState
  legalAccepted: boolean
} & NavigationProps<'Landing'>

class Landing extends Component<Props> {
  _onVersionClick = () => {
    if (!this.props.isFloonet) {
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
              this.props.switchToFloonet()
            },
          },
        ],
      )
    }
  }
  _onNewWallet = (isNew: boolean) => {
    return () => {
      const nextScreenName = 'NewPassword'
      const nextScreenParams = {
        isNew,
      }
      if (this.props.legalAccepted) {
        this.props.navigation.navigate(nextScreenName, nextScreenParams)
      } else {
        this.props.navigation.navigate('LegalDisclaimer', {
          nextScreen: {
            name: nextScreenName,
            params: nextScreenParams,
          },
        })
      }
    }
  }

  render() {
    const { isFloonet, switchToMainnet } = this.props
    return (
      <Wrapper testID="LandingScreen">
        <FlexGrow />
        <View>
          <AppTitle>Ironbelly</AppTitle>
          <AppSlogan>Grin wallet you've deserved</AppSlogan>
        </View>

        <ActionButton
          title="Create new wallet"
          testID="NewWalletButton"
          disabled={false}
          onPress={this._onNewWallet(true)}
        />
        <ActionButton
          title="Restore from paper key"
          disabled={false}
          onPress={this._onNewWallet(false)}
        />
        <Spacer />
        {isFloonet && (
          <FloonetDisclaimer>
            <Text
              style={{
                textAlign: 'center',
                width: '100%',
              }}>
              This app is configured to use testnet
            </Text>
            <NativeButton
              title="Switch to mainnet"
              onPress={() => switchToMainnet()}
            />
          </FloonetDisclaimer>
        )}
        <FlexGrow />
        <TouchableOpacity
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            paddingBottom: 8,
          }}
          onPress={this._onVersionClick}>
          <Text style={{}}>
            Version: {DeviceInfo.getVersion()} build{' '}
            {DeviceInfo.getBuildNumber()}
          </Text>
        </TouchableOpacity>
      </Wrapper>
    )
  }
}

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
