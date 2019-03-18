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
import { View, ActivityIndicator } from 'react-native'
import { connect } from 'react-redux'
import Strategy from './../Send/strategy'
import { Button } from 'components/CustomFont'
import Header from 'components/Header'

import { hrGrin } from 'common'
import { colors, Spacer, FlexGrow, Wrapper, LoaderView } from 'common'
import { type TxForm } from 'modules/tx'
import { type State as ReduxState, type Navigation, type RustOutputStrategy } from 'common/types'

type Props = {
  txCreate: (amount: number, message: string, selectionStrategyIsUseAll: boolean) => void,
  txSendHttps: (
    amount: number,
    message: string,
    url: string,
    selectionStrategyIsUseAll: boolean
  ) => void,
  resetTxForm: () => void,
  setAmount: (amount: number) => void,
  requestStrategies: (amount: number) => void,
  setMessage: (message: string) => void,
  setURL: (url: string) => void,
  setOutputStrategies: (outputStrategies: Array<RustOutputStrategy>) => void,
  txForm: TxForm,
  isSent: boolean,
  navigation: Navigation,
  isSending: boolean,
}

type State = {}

//Images
import CloseImg from 'assets/images/x.png'

class SendLink extends Component<Props, State> {
  componentDidUpdate(prevProps) {
    if (
      (!prevProps.txForm.outputStrategies_error && this.props.txForm.outputStrategies_error) ||
      (!prevProps.isSent && this.props.isSent)
    ) {
      this.props.navigation.goBack()
    }
  }

  componentDidMount() {
    const { requestStrategies, setAmount, setMessage, setURL, resetTxForm, navigation } = this.props
    resetTxForm()
    requestStrategies(navigation.state.params.amount)
    setAmount(navigation.state.params.amount)
    setMessage(navigation.state.params.message)
    setURL(navigation.state.params.url)
  }

  render() {
    const { txForm, navigation, isSending } = this.props
    const { amount, message, outputStrategy, url, outputStrategies_inProgress } = txForm
    return (
      <React.Fragment>
        <Header
          leftIcon={CloseImg}
          leftAction={() => navigation.goBack(null)}
          title={`Pay ${hrGrin(amount)}`}
        />
        {((outputStrategies_inProgress || isSending) && (
          <LoaderView>
            <ActivityIndicator size="large" color={colors.primary} />
          </LoaderView>
        )) || (
          <Wrapper>
            <View style={{ flexShrink: 1 }}>
              <Strategy />
            </View>
            <FlexGrow />
            <Button
              testID="PayButton"
              title={'Next'}
              onPress={() => {
                if (outputStrategy) {
                  this.props.txSendHttps(
                    amount,
                    message,
                    url,
                    outputStrategy.selectionStrategyIsUseAll
                  )
                }
              }}
              disabled={false}
            />
            <Spacer />
          </Wrapper>
        )}
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  txForm: state.tx.txForm,
  isSent: state.tx.txSend.sent,
  isSending: state.tx.txSend.inProgress,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  txSendHttps: (
    amount: number,
    message: string,
    url: string,
    selectionStrategyIsUseAll: boolean
  ) => {
    dispatch({ type: 'TX_SEND_HTTPS_REQUEST', amount, message, url, selectionStrategyIsUseAll })
  },
  setAmount: amount =>
    dispatch({ type: 'TX_FORM_SET_AMOUNT', amount, textAmount: amount.toString() }),
  setMessage: message => dispatch({ type: 'TX_FORM_SET_MESSAGE', message }),
  setURL: url => dispatch({ type: 'TX_FORM_SET_URL', url }),
  resetTxForm: () => dispatch({ type: 'TX_FORM_RESET' }),
  requestStrategies: amount => dispatch({ type: 'TX_FORM_OUTPUT_STRATEGIES_REQUEST', amount }),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SendLink)
