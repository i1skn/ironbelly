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
import { connect } from 'react-redux'
import { Text } from 'components/CustomFont'
import styled from 'styled-components'

import { type State as GlobalState, type Navigation } from 'common/types'
import { colors } from 'common'

import { type WalletInitState } from 'modules/wallet'

type Props = {
  navigation: Navigation,
  walletInit: WalletInitState,
}

type State = {}

const Wrapper = styled.View`
  background: ${colors.primary};
  flex-grow: 1;
  justify-content: center;
`

const Message = styled(Text)`
  font-size: 20;
  text-align: center;
`

class RecoveryInProgress extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.walletInit.inProgress !== prevProps.walletInit.inProgress &&
      !this.props.walletInit.inProgress
    ) {
      this.props.navigation.navigate('Overview')
    }
  }

  render() {
    return (
      <Wrapper>
        <Message>Recovery in progress...</Message>
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: GlobalState) => {
  return {
    walletInit: state.wallet.walletInit,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecoveryInProgress)
