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
import { type WalletRepairState } from 'modules/wallet'
import KeepAwake from 'react-native-keep-awake'

type Props = WalletRepairState & {
  navigation: Navigation,
  repairWallet: () => void,
  resetRepaired: () => void,
}
type State = {}

const StatusText = styled(Text)`
  font-size: 24;
`

const Wrapper = styled(LoaderView)`
  padding: 16px;
`

class WalletRepair extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  state = {}

  componentDidMount() {
    const { navigation, repaired, repairWallet } = this.props
    if (!repaired) {
      repairWallet()
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
    const { navigation, repaired, resetRepaired } = this.props
    return (
      <Wrapper>
        {(!repaired && (
          <Fragment>
            <KeepAwake />
            <ActivityIndicator size="large" color={colors.primary} />
            <Spacer />
            <StatusText style={{ textAlign: 'center' }}>Repair in progress</StatusText>
            <Spacer />
            <Text style={{ textAlign: 'center' }}>
              Please do not close or background the app during this process. It can take a couple of
              minutes to finish.
            </Text>
          </Fragment>
        )) || (
          <Fragment>
            <StatusText>Your wallet was succesfully repaired!</StatusText>
            <Spacer />
            <Button
              testID="ShowMeButton"
              title="Continue"
              disabled={false}
              onPress={() => {
                resetRepaired()
                navigation.navigate('Overview')
              }}
            />
          </Fragment>
        )}
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  ...state.wallet.walletRepair,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  repairWallet: () => {
    dispatch({ type: 'WALLET_REPAIR_REQUEST' })
  },
  resetRepaired: () => {
    dispatch({ type: 'WALLET_REPAIR_RESET' })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletRepair)
