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
import { KeyboardAvoidingView } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'

import { Title, SubTitle, Spacer } from 'common'
import { Text, Button } from 'components/CustomFont'
import { type State as ReduxState, type Error, type Navigation } from 'common/types'

const pkg = require('../../package.json')

type Props = {
  walletInit: () => void,
  error: Error,
  walletCreated: boolean,
  navigation: Navigation,
}
type State = {
  inputValue: string,
  amount: number,
  valid: boolean,
}

const FlexGrow = styled.View`
  flex-grow: 1;
`

const Wrapper = styled(KeyboardAvoidingView)`
  padding: 20px;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
`

const ActionButton = styled(Button)`
  margin-bottom: 20;
  width: 100%;
`

class Landing extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  state = {
    inputValue: '',
    amount: 0,
    valid: false,
  }

  componentDidMount() {}

  componentDidUpdate(prevProps) {
    if (prevProps.walletCreated != this.props.walletCreated && this.props.walletCreated) {
      this.props.navigation.navigate('Mnemonic')
    }
  }

  render() {
    const { navigation, walletInit } = this.props

    return (
      <Wrapper behavior="padding">
        <FlexGrow />
        <Title>Welcome to Ironbelly</Title>
        <SubTitle>Grin wallet you've deserved</SubTitle>

        <ActionButton
          title="Initiate new wallet"
          disabled={false}
          onPress={() => {
            walletInit()
          }}
        />
        <ActionButton
          title="Restore from phrase"
          disabled={false}
          onPress={() => {
            navigation.navigate('Recovery')
          }}
        />
        <FlexGrow />
        <Text>Version: {pkg.version} (alpha)</Text>
        <Spacer />
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  settings: state.settings,
  isCreated: state.tx.txCreate.created,
  error: state.tx.txCreate.error,
  walletCreated: !!state.wallet.walletInit.mnemonic,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  walletInit: () => {
    dispatch({ type: 'WALLET_INIT_REQUEST' })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Landing)
