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
import styled from 'styled-components/native'

import { FlexGrow, Title } from 'common'
import NumericInput from 'components/NumericInput'
import {
  type State as ReduxState,
  type Currency,
  type Error,
  type Navigation,
  type OutputStrategy,
} from 'common/types'

import { type TxForm } from 'modules/tx'
import ChevronLeftImg from 'assets/images/ChevronLeft.png'
import { store } from 'common/redux'
import { type MoveFunc } from 'components/ScreenWithManySteps'

type Props = {
  setAmount: (amount: number, textAmount: string) => void,
  setOutputStrategy: (outputStrategy: OutputStrategy) => void,
  settings: {
    currency: Currency,
  },
  error: Error,
  navigation: Navigation,
  txForm: TxForm,
  move: MoveFunc,
  resetStrategies: () => void,
}

type State = {}

const GrinAmount = styled(NumericInput)`
  margin-bottom: 8;
`

class Send extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }
  static backButtonText = 'Back'
  static backButtonIcon = ChevronLeftImg
  static backButtonDelta = -2
  static nextButtonText = 'Next'
  static nextButtonDisabled = () => {
    const state = store.getState()
    return !state.tx.txForm.amount
  }
  static nextButtonClick = (move: MoveFunc) => {
    return () => {
      move(1)
    }
  }

  componentDidMount() {
    this.props.resetStrategies()
  }
  componentDidUpdate(prevProps) {
    if (!prevProps.txForm.outputStrategies.length && this.props.txForm.outputStrategies.length) {
      this.props.move(1)
    }
  }

  render() {
    const { setAmount, txForm } = this.props

    return (
      <React.Fragment>
        <Title>How much to send?</Title>
        <FlexGrow>
          <GrinAmount
            autoFocus={true}
            onChange={(value: string) => {
              const amount = parseFloat(value.replace(/,/, '.') || '0')
              if (!isNaN(amount) && amount) {
                setAmount(amount * 1e9, value)
              } else {
                setAmount(0, value)
              }
            }}
            value={txForm.textAmount}
            maxLength={100000}
            units="ツ"
          />
          {/*<FiatAmount>{hrFiat(convertToFiat(txForm.amount, currency), currency)}</FiatAmount>*/}
        </FlexGrow>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  txForm: state.tx.txForm,
  settings: state.settings,
  error: state.tx.txCreate.error,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setAmount: (amount: number, textAmount: string) => {
    dispatch({ type: 'TX_FORM_SET_AMOUNT', amount, textAmount })
  },
  resetStrategies: amount => {
    dispatch({ type: 'TX_FORM_OUTPUT_STRATEGIES_SUCCESS', outputStrategies: [] })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Send)
