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
import { View, AlertIOS } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'

import { Text } from 'components/CustomFont'
import FormTextInput from 'components/FormTextInput'
import { type State as ReduxState, type Currency, type Error, type Navigation } from 'common/types'
import { FlexGrow, Title } from 'common'
import { Button } from 'components/CustomFont'
import { type TxForm } from 'modules/tx'
import ChevronLeftImg from 'assets/images/ChevronLeft.png'
import { store } from 'common/redux'
import { type MoveFunc } from 'components/ScreenWithManySteps'

type Props = {
  settings: {
    currency: Currency,
  },
  error: Error,
  isCreated: boolean,
  navigation: Navigation,
  txForm: TxForm,
  move: MoveFunc,
  setUrl: (url: string) => void,
}

type State = {}

class Address extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  static backButtonText = 'Back'
  static backButtonIcon = ChevronLeftImg
  static nextButtonText = 'Next'
  static nextButtonDisabled = () => {
    const url = store.getState().tx.txForm.url
    return url.toLowerCase().indexOf('https://') === -1
  }
  static nextButtonClick = (move: MoveFunc) => {
    return () => {
      AlertIOS.alert(
        'Alert!',
        'Send via https is not implemented yet. Fallback to sharing the file',
        [
          {
            text: 'Ok',
            onPress: () => move(1),
          },
        ]
      )
    }
  }

  state = {}

  render() {
    const { txForm, setUrl } = this.props

    return (
      <View>
        <Title>How to send?</Title>
        <FlexGrow>
          <FormTextInput
            autoFocus={true}
            onChange={url => setUrl(url)}
            value={txForm.url}
            placeholder="https://"
          />
        </FlexGrow>
      </View>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  txForm: state.tx.txForm,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setUrl: (url: string) => {
    dispatch({ type: 'TX_FORM_SET_URL', url })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Address)
