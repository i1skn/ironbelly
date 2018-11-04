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
type Props = {
  setAmount: (amount: number, textAmount: string) => void,
  setOutputStrategy: (outputStrategy: OutputStrategy) => void,
  settings: {
    currency: Currency,
  },
  error: Error,
  isCreated: boolean,
  navigation: Navigation,
  txForm: TxForm,
}

type State = {}

const GrinAmount = styled(NumericInput)`
  margin-bottom: 8;
`

class Send extends Component<Props, State> {
  static navigationOptions = {
    header: null,
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
  isCreated: state.tx.txCreate.created,
  error: state.tx.txCreate.error,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  // txCreate: (amount: number, message: string) => {
  // dispatch({ type: 'TX_CREATE_REQUEST', amount, message })
  // },
  setAmount: (amount: number, textAmount: string) => {
    dispatch({ type: 'TX_FORM_SET_AMOUNT', amount, textAmount })
  },
})

export const validate = ({ amount }: { amount: number }) => {
  return !!amount
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Send)
