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
import DeviceInfo from 'react-native-device-info'
import { connect } from 'react-redux'
import styled from 'styled-components/native'

import { FlexGrow } from 'common'
import colors from 'common/colors'

import { Text, Button } from 'components/CustomFont'
import { type State as ReduxState, type Error, type Navigation } from 'common/types'

type Props = {
  walletInit: () => void,
  error: Error,
  walletCreated: boolean,
  navigation: Navigation,
  setIsNew: (value: boolean) => void,
}
type State = {
  inputValue: string,
  amount: number,
  valid: boolean,
}

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
  color: ${() => colors.grey};
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

  render() {
    const { navigation, setIsNew } = this.props

    return (
      <Wrapper behavior="padding" testID="LandingScreen">
        <FlexGrow />
        <View>
          <AppTitle>Ironbelly</AppTitle>
          <AppSlogan>Grin wallet you've deserved</AppSlogan>
        </View>

        <ActionButton
          title="New wallet"
          testID="NewWalletButton"
          disabled={false}
          onPress={() => {
            setIsNew(true)
            navigation.navigate('NewPassword')
          }}
        />
        <ActionButton
          title="Restore"
          disabled={false}
          onPress={() => {
            setIsNew(false)
            navigation.navigate('NewPassword')
          }}
        />
        <FlexGrow />
        <Text style={{ textAlign: 'center', width: '100%' }}>
          Version: {DeviceInfo.getVersion()} build {DeviceInfo.getBuildNumber()}
        </Text>
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  settings: state.settings,
  isCreated: state.tx.txCreate.created,
  error: state.tx.txCreate.error,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setIsNew: value => {
    dispatch({ type: 'WALLET_INIT_SET_IS_NEW', value })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Landing)
