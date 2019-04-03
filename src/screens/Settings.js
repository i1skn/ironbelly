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
import { KeyboardAvoidingView, Alert, Linking, Button as NativeButton } from 'react-native'
import RNFS from 'react-native-fs'
import { connect } from 'react-redux'
import styled from 'styled-components/native'

import { WALLET_DATA_DIRECTORY, Spacer } from 'common'
import { Text, Button } from 'components/CustomFont'
import { type State as ReduxState, type Currency, type Error, type Navigation } from 'common/types'
import Header from 'components/Header'

//Images
import ChevronLeftImg from 'assets/images/ChevronLeft.png'

type Props = {
  setCheckNodeApiHttpAddr: (checkNodeApiHttpAddr: string) => void,
  getPhrase: () => void,
  clearWallet: () => void,
  settings: {
    currency: Currency,
    checkNodeApiHttpAddr: string,
  },
  error: Error,
  isCreated: boolean,
  navigation: Navigation,
}
type State = {
  inputValue: string,
  amount: number,
  valid: boolean,
}

const Wrapper = styled(KeyboardAvoidingView)`
  padding: 16px;
  flex-grow: 1;
`

const FeedbackText = styled(Text)`
  font-size: 18;
  margin-top: 2;
  text-align: center;
`

class Settings extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  state = {
    inputValue: '',
    amount: 0,
    valid: false,
  }

  componentDidMount() {}

  componentDidUpdate(prevProps) {}

  render() {
    const { navigation, getPhrase, clearWallet } = this.props
    return (
      <React.Fragment>
        <Header
          leftIcon={ChevronLeftImg}
          leftText={'Back'}
          leftAction={() => this.props.navigation.goBack()}
          title="Settings"
        />
        <Wrapper behavior="padding">
          <Button
            title="Paper key"
            disabled={false}
            onPress={() => {
              getPhrase()
              navigation.navigate('ViewPaperKey')
            }}
          />
          <Spacer />
          <Button
            title="Destroy this wallet"
            disabled={false}
            danger
            onPress={() => {
              Alert.alert(
                'Destroy this wallet',
                'This action would remove all of your data! Please back up your recovery phrase before!',
                [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                  },
                  {
                    text: 'Destroy',
                    style: 'destructive',
                    onPress: () => {
                      RNFS.unlink(WALLET_DATA_DIRECTORY).then(() => {
                        clearWallet()
                        navigation.navigate('Initial')
                      })
                    },
                  },
                ]
              )
            }}
          />
          <Spacer />
          <FeedbackText>Got a feedback? Send it to:</FeedbackText>
          <NativeButton
            onPress={() => Linking.openURL('mailto:ironbelly@cycle42.com')}
            title="ironbelly@cycle42.com"
          />
        </Wrapper>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  settings: state.settings,
  isCreated: state.tx.txCreate.created,
  error: state.tx.txCreate.error,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setCheckNodeApiHttpAddr: (checkNodeApiHttpAddr: string) => {
    dispatch({ type: 'SET_SETTINGS', newSettings: { checkNodeApiHttpAddr } })
  },
  getPhrase: () => {
    dispatch({ type: 'WALLET_PHRASE_REQUEST' })
  },
  clearWallet: () => {
    dispatch({ type: 'TX_LIST_CLEAR' })
    dispatch({ type: 'WALLET_CLEAR' })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings)
