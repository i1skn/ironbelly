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
import { View } from 'react-native'
import { Text } from 'components/CustomFont'
import { connect } from 'react-redux'
import styled from 'styled-components/native'

import FormTextInput from 'components/FormTextInput'
import { type State as ReduxState } from 'common/types'

const Title = styled(Text)`
  font-size: 27;
  font-weight: 500;
`

type Props = {
  setPassword: (password: string) => void,
  error: Error,
  isCreated: boolean,
  walletRecovery: {
    phrase: string,
    password: string,
  },
}

type State = {}

class Password extends Component<Props, State> {
  render() {
    const { walletRecovery } = this.props
    return (
      <View>
        <Title>Password</Title>
        <Text>Currently only an empty password is supported</Text>
        <View style={{ flexGrow: 1, width: '100%' }}>
          <FormTextInput
            autoFocus={false}
            readonly={true}
            onChange={() => {}}
            value={walletRecovery.password}
            placeholder="empty password"
          />
        </View>
        <View style={{ flexGrow: 1 }} />
      </View>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  walletRecovery: state.wallet.walletRecovery,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setPassword: password => {
    dispatch({ type: 'WALLET_RECOVERY_SET_PASSWORD', password })
  },
})

export const validate = (_: any) => {
  return true
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Password)
