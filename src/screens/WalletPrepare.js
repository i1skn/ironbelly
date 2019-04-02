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

import React, { Component, Fragment } from 'react'
import { ActivityIndicator } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'

import { Spacer, LoaderView } from 'common'
import colors from 'common/colors'
import { type State as ReduxState, type Navigation } from 'common/types'
import { Text, Button } from 'components/CustomFont'
import { type WalletInitState } from 'modules/wallet'

type Props = WalletInitState & {
  navigation: Navigation,
  createWallet: (password: string, mnemonic: string, isNew: boolean) => void,
}
type State = {}

const StatusText = styled(Text)`
  font-size: 24;
`

const Wrapper = styled(LoaderView)`
  padding: 16px;
`

class WalletPrepare extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  state = {}

  componentDidMount() {
    const { password, created, createWallet, isNew, navigation } = this.props
    if (!created && navigation.state.params && navigation.state.params.phrase) {
      createWallet(password, navigation.state.params.phrase, isNew)
    } else {
      navigation.goBack()
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.error.message && !prevProps.error.message) {
      this.props.navigation.goBack()
    }
  }

  render() {
    const { navigation, created, isNew } = this.props
    return (
      <Wrapper>
        {(!created && (
          <Fragment>
            <ActivityIndicator size="large" color={colors.primary} />
            {!isNew && (
              <Fragment>
                <Spacer />
                <StatusText style={{ textAlign: 'center' }}>Recovery in progress</StatusText>
                <Spacer />
                <Text style={{ textAlign: 'center' }}>
                  Please do not close or background the app during this process. It can take a
                  couple of minutes to finish.
                </Text>
              </Fragment>
            )}
          </Fragment>
        )) || (
          <Fragment>
            <StatusText>Your wallet was succesfully created!</StatusText>
            <Spacer />
            <Button
              testID="ShowPaperKeyFinishButton"
              title="Show me"
              disabled={false}
              onPress={() => {
                navigation.navigate('Main')
              }}
            />
          </Fragment>
        )}
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  ...state.wallet.walletInit,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  createWallet: (password, phrase, isNew) => {
    dispatch({ type: 'WALLET_INIT_REQUEST', password, phrase, isNew })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletPrepare)
