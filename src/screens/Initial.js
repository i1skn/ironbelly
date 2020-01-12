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
import { ActivityIndicator } from 'react-native'
import { connect } from 'react-redux'

import { isWalletInitialized, LoaderView } from 'common'
import colors from 'common/colors'
import { FLOONET_CHAIN, MAINNET_CHAIN, MAINNET_DEFAULT_NODE } from 'modules/settings'
import { type State as ReduxState, type Error, type Navigation } from 'common/types'
import { type State as SettingsState } from 'modules/settings'

type Props = {
  settings: SettingsState,
  error: Error,
  isCreated: boolean,
  navigation: Navigation,
  switchToMainnet: () => void,
  checkBiometry: () => void,
  scanInProgress: boolean,
}
type State = {}

class Initial extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  state = {}

  componentDidMount() {
    const { checkBiometry, navigation, settings, scanInProgress } = this.props
    checkBiometry()
    isWalletInitialized().then(exists => {
      if (exists) {
        navigation.navigate('Password', {
          nextScreen: scanInProgress
            ? { name: 'WalletScan', params: { isNew: false } }
            : { name: 'Main' },
        })
      } else {
        if (settings.chain === FLOONET_CHAIN) {
          this.props.switchToMainnet()
        }
        navigation.navigate('WalletCreate')
      }
    })
  }

  componentDidUpdate(prevProps) {}

  render() {
    return (
      <LoaderView>
        <ActivityIndicator size="large" color={colors.primary} />
      </LoaderView>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  settings: state.settings,
  scanInProgress: state.wallet.walletScan.inProgress,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  switchToMainnet: () => {
    dispatch({ type: 'SWITCH_TO_MAINNET' })
  },
  checkBiometry: () => {
    dispatch({ type: 'CHECK_BIOMETRY_REQUEST' })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Initial)
