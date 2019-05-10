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
import { KeyboardAvoidingView, View } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import Header from 'components/Header'

import FormTextInput from 'components/FormTextInput'
import { hrGrin } from 'common'
import { Text } from 'components/CustomFont'
import {
  type State as ReduxState,
  type Currency,
  type Tx,
  type Error,
  type Navigation,
} from 'common/types'

//Images
import ChevronLeftImg from 'assets/images/ChevronLeft.png'

type Props = {
  txGet: (id: number) => void,
  tx: Tx,
  settings: {
    currency: Currency,
  },
  error: Error,
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

const FieldTitle = styled(Text)`
  font-size: 16;
  font-weight: 600;
  margin-top: 20;
  margin-bottom: 10;
`

class TxDetails extends Component<Props, State> {
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
    const { navigation, tx } = this.props
    return (
      <React.Fragment>
        <Header
          leftIcon={ChevronLeftImg}
          leftText={'Back'}
          leftAction={() => navigation.goBack()}
        />

        <Wrapper behavior="padding">
          {tx && (
            <View style={{ flexGrow: 1 }}>
              <FieldTitle>Amount</FieldTitle>
              <FormTextInput
                autoFocus={false}
                readonly={true}
                onChange={() => {}}
                value={hrGrin(tx.amount)}
              />

              {!!tx.fee && (
                <React.Fragment>
                  <FieldTitle>Fee</FieldTitle>
                  <FormTextInput
                    autoFocus={false}
                    readonly={true}
                    onChange={() => {}}
                    value={hrGrin(tx.fee)}
                  />
                </React.Fragment>
              )}
              <FieldTitle>Date</FieldTitle>
              <FormTextInput
                autoFocus={false}
                readonly={true}
                onChange={() => {}}
                value={tx.creationTime.fromNow()}
              />
            </View>
          )}
        </Wrapper>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ReduxState, ownProps: Props) => () => {
  return {
    settings: state.settings,
    tx: state.tx.list.data.find(tx => tx.id === ownProps.navigation.state.params.txId),
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TxDetails)
