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
import { ActivityIndicator } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import { type State as SettingsState } from 'modules/settings'

import { LoaderView, hrGrin, Spacer, FlexGrow, Title } from 'common'
import colors from 'common/colors'
import {
  type State as ReduxState,
  type Error,
  type Navigation,
  type OutputStrategy,
  type Balance,
} from 'common/types'

import { type TxForm } from 'modules/tx'
import ChevronLeftImg from 'assets/images/ChevronLeft.png'
import { store } from 'common/redux'
import { type MoveFunc } from 'components/ScreenWithManySteps'

type State = {}

const Option = styled.TouchableOpacity`
  flex-grow: 1;
  border-left-width: 5;
  background: #f8f8f8;
  border-left-color: ${props => (props.active ? colors.primary : colors.grey[300])};
  align-items: flex-start;
  padding: 8px 0 8px 16px;
  margin-bottom: 32px;
`

const Row = styled.Text`
  padding: 4px 0;
  font-size: 16;
`

const Amount = styled(Row)`
  font-weight: 400;
`

const Fee = styled(Row)`
  font-weight: 400;
  color: #fa6800;
`

const Locked = styled(Row)`
  font-weight: 600;
`

const Spendable = styled(Row)`
  font-weight: 600;
  color: #2eb358;
`

class Strategy extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  static backButtonText = 'Back'
  static backButtonIcon = ChevronLeftImg
  static nextButtonText = 'Next'
  static nextButtonDisabled = () => {
    const state = store.getState()
    return !state.tx.txForm.outputStrategy
  }
  static nextButtonClick = (move: MoveFunc) => {
    return () => {
      move(1)
    }
  }

  componentDidMount() {
    const { txForm } = this.props
    this.props.requestStrategies(txForm.amount)
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.txForm.outputStrategies_error && this.props.txForm.outputStrategies_error) {
      this.props.move(-1)
    }
  }

  render() {
    const { txForm, setOutputStrategy, balance } = this.props
    return txForm.outputStrategies.length ? (
      <React.Fragment>
        <Title>{txForm.outputStrategies.length > 1 ? 'Choose strategy' : 'Overview'}</Title>
        <Spacer />
        <FlexGrow>
          {txForm.outputStrategies.map((outputStrategy, i) => (
            <Option
              key={i}
              active={txForm.outputStrategy === outputStrategy}
              onPress={() => {
                setOutputStrategy(outputStrategy)
              }}
            >
              <Amount>Amount to send: {hrGrin(txForm.amount)}</Amount>
              <Fee>Payment fee: {hrGrin(outputStrategy.fee)}</Fee>
              <Locked>Would be locked: {hrGrin(outputStrategy.total)}</Locked>
              <Spendable>
                Spendable: {hrGrin(balance.amountCurrentlySpendable - outputStrategy.total)}
              </Spendable>
            </Option>
          ))}
          {/*<FiatAmount>{hrFiat(convertToFiat(txForm.amount, currency), currency)}</FiatAmount>*/}
        </FlexGrow>
      </React.Fragment>
    ) : (
      <LoaderView>
        <ActivityIndicator style={{ marginTop: '75%' }} size="large" color={colors.primary} />
      </LoaderView>
    )
  }
}

type Props = {
  requestStrategies: (amount: number) => void,
  setOutputStrategy: (outputStrategy: OutputStrategy) => void,
  settings: SettingsState,
  balance: Balance,
  error: Error,
  isCreated: boolean,
  navigation: Navigation,
  txForm: TxForm,
  move: MoveFunc,
}

const mapStateToProps = (state: ReduxState) => ({
  txForm: state.tx.txForm,
  settings: state.settings,
  error: state.tx.txCreate.error,
  balance: state.balance.data,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  requestStrategies: amount => dispatch({ type: 'TX_FORM_OUTPUT_STRATEGIES_REQUEST', amount }),
  setOutputStrategy: outputStrategy => {
    dispatch({ type: 'TX_FORM_SET_OUTPUT_STRATEGY', outputStrategy })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Strategy)
