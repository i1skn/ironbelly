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
  setMessage: (message: string) => void,
  settings: {
    currency: Currency,
  },
  error: Error,
  isCreated: boolean,
  navigation: Navigation,
  txForm: TxForm,
  move: MoveFunc,
}

type State = {
  url: string,
}

const Or = styled(Text)`
  text-align: center;
  font-size: 20;
  margin: 8px 0;
`

class Transport extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  static backButtonText = 'Back'
  static backButtonIcon = ChevronLeftImg
  static nextButtonText = 'Next'
  static nextButtonHide = true
  static nextButtonDisabled = () => {
    return false
  }
  static nextButtonClick = (move: MoveFunc) => {
    return () => {
      move(1)
    }
  }

  state = {
    url: '',
  }

  render() {
    const { setMessage, txForm, move } = this.props
    const { url } = this.state

    return (
      <View>
        <Title>How to send?</Title>
        <FlexGrow>
          <Button
            testID="ShareAsAFile"
            title={'Share as a file'}
            onPress={() => move(2)}
            disabled={false}
          />
          <Or>or</Or>
          <Button
            testID="ShareAsAFile"
            title={'Send via https'}
            onPress={() => move(1)}
            disabled={false}
          />
        </FlexGrow>
      </View>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  txForm: state.tx.txForm,
  settings: state.settings,
  isCreated: state.tx.txCreate.created,
  error: state.tx.txCreate.error,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setMessage: (message: string) => {
    dispatch({ type: 'TX_FORM_SET_MESSAGE', message })
  },
})

export const validate = (_: any) => {
  return true
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Transport)
