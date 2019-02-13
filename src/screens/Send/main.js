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
import { Keyboard, NativeModules } from 'react-native'
import { connect } from 'react-redux'
import Amount, { validate as AmountValidate } from './amount'
import Strategy, { validate as StrategyValidate } from './strategy'
import Message, { validate as MessageValidate } from './message'
import { log } from 'common/logger'

import ManyStepsView from 'components/ManyStepsView'
const { GrinBridge } = NativeModules

import { type TxForm } from 'modules/tx'
import { type State as SettingsState } from 'modules/settings'
import {
  type State as ReduxState,
  type Error,
  type Navigation,
  type RustOutputStrategy,
  type Step,
} from 'common/types'

type Props = {
  txCreate: (amount: number, message: string, selectionStrategyIsUseAll: boolean) => void,
  setOutputStrategies: (outputStrategies: Array<RustOutputStrategy>) => void,
  txForm: TxForm,
  settings: SettingsState,
  error: Error,
  isCreated: boolean,
  navigation: Navigation,
}

type State = {}

class Send extends Component<Props, State> {
  steps: Array<Step>
  constructor(props) {
    super(props)
    this.steps = [
      {
        container: Amount,
        validate: () => {
          return AmountValidate(this.props.txForm)
        },
        onNextPress: (e, next) => {
          const { checkNodeApiHttpAddr } = props.settings
          return GrinBridge.txStrategies('default', '', checkNodeApiHttpAddr, props.txForm.amount)
            .then((json: string) => JSON.parse(json))
            .then(outputStrategies => {})
            .catch(error => {
              log(error, true)
            })
        },
      },
      {
        container: Strategy,
        validate: () => {
          return StrategyValidate(this.props.txForm)
        },
      },
      {
        container: Message,
        validate: () => {
          return MessageValidate(this.props.txForm)
        },
      },
    ]
  }
  componentDidUpdate(prevProps) {
    if (!prevProps.isCreated && this.props.isCreated) {
      this.props.navigation.goBack()
    }
    this.steps[0].onNextPress = (e, next) => {
      const { checkNodeApiHttpAddr } = this.props.settings
      GrinBridge.txStrategies('default', '', checkNodeApiHttpAddr, this.props.txForm.amount)
        .then((json: string) => JSON.parse(json))
        .then(outputStrategies => {
          this.props.setOutputStrategies(outputStrategies)
          next()
        })
        .catch(error => {
          log(error, true)
        })
    }
  }

  render() {
    const { navigation, txForm } = this.props
    const { amount, message, outputStrategy } = txForm
    return (
      <ManyStepsView
        steps={this.steps}
        navigation={navigation}
        cancelAction={() => {
          Keyboard.dismiss()
          this.props.navigation.goBack()
        }}
        finalAction={() => {
          if (outputStrategy) {
            this.props.txCreate(amount, message, outputStrategy.selectionStrategyIsUseAll)
          }
        }}
      />
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  settings: state.settings,
  txForm: state.tx.txForm,
  isCreated: state.tx.txCreate.created,
  error: state.tx.txCreate.error,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  txCreate: (amount: number, message: string, selectionStrategyIsUseAll: boolean) => {
    dispatch({ type: 'TX_CREATE_REQUEST', amount, message, selectionStrategyIsUseAll })
  },
  setOutputStrategies: outputStrategies => {
    dispatch({ type: 'TX_FORM_SET_OUTPUT_STRATEGIES_SUCCESS', outputStrategies })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Send)
