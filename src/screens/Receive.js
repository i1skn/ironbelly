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
import { View, KeyboardAvoidingView, ActivityIndicator } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import Header from 'components/Header'

import { Text, Button } from 'components/CustomFont'

import { LoaderView, TextareaTitle, Textarea, hrGrin, Spacer } from 'common'
import colors from 'common/colors'
import { type State as GlobalState, type Navigation, type Slate } from 'common/types'

//Images
import CloseImg from 'assets/images/x.png'

type Props = {
  navigation: Navigation,
  txReceive: (slatePath: string) => void,
  slateRequest: (slatePath: string) => void,
  isReceived: boolean,
  slate: ?Slate,
}

type State = {}

const Wrapper = styled(KeyboardAvoidingView)`
  padding: 16px;
  flex-grow: 1;
`

const Title = styled(Text)`
  font-size: 27;
  font-weight: 500;
  margin-bottom: 20;
`

class Receive extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  componentDidMount() {
    const { navigation, slateRequest } = this.props
    const { slatePath } = navigation.state.params
    slateRequest(slatePath)
  }
  componentDidUpdate(prevProps) {
    const { navigation, isReceived } = this.props
    if (isReceived) {
      navigation.goBack()
    }
  }
  render() {
    const { navigation, txReceive, slate } = this.props
    const { slatePath } = navigation.state.params
    return (
      <React.Fragment>
        <Header
          leftIcon={CloseImg}
          leftText={'Cancel'}
          leftAction={() => navigation.navigate('Overview')}
        />
        <Wrapper behavior="padding">
          {(slate && (
            <React.Fragment>
              <Title>{`Incoming ${hrGrin(slate.amount)}`}</Title>
              <View style={{ flex: 1 }}>
                <TextareaTitle>Sender message</TextareaTitle>
                <Textarea>
                  {slate.participant_data[0] && slate.participant_data[0].message}
                </Textarea>
                <TextareaTitle>Fee</TextareaTitle>
                <Textarea>{hrGrin(slate.fee)}</Textarea>
              </View>
              <Spacer />
              <Button
                title={'Accept'}
                onPress={() => {
                  txReceive(slatePath)
                }}
              />
              <Spacer />
            </React.Fragment>
          )) || (
            <LoaderView>
              <ActivityIndicator size="large" color={colors.primary} />
            </LoaderView>
          )}
        </Wrapper>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: GlobalState) => {
  return {
    slate: state.tx.slate.data,
    isReceived: state.tx.txReceive.received,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  txReceive: slatePath => {
    dispatch({ type: 'TX_RECEIVE_REQUEST', slatePath })
  },
  slateRequest: slatePath => {
    dispatch({ type: 'SLATE_LOAD_REQUEST', slatePath, isResponse: false })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Receive)
