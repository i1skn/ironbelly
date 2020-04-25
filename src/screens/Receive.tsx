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
import Header from 'src/components/Header'
import { Text, Button } from 'src/components/CustomFont'
import {
  isAndroid,
  LoaderView,
  TextareaTitle,
  Textarea,
  hrGrin,
  Spacer,
} from 'src/common'
import colors from 'src/common/colors'
import { State as GlobalState, Navigation, Slate } from 'src/common/types' //Images
import { NavigationProps } from 'src/common/types'
import CloseImg from 'src/assets/images/x.png'

interface OwnProps {
  txReceive: (slatePath: string) => void
  slateRequest: (slatePath: string) => void
  isReceived: boolean
  slate: Slate | undefined | null
}

type Props = NavigationProps<'Receive'> & OwnProps

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
  componentDidUpdate() {
    const { navigation, isReceived } = this.props

    if (isReceived) {
      navigation.goBack()
    }
  }

  render() {
    const { navigation, route, txReceive, slate } = this.props
    const { slatePath } = route?.params ?? {}
    return (
      <React.Fragment>
        <Header
          leftIcon={CloseImg}
          leftText={'Cancel'}
          leftAction={() => navigation.navigate('Overview')}
        />
        <Wrapper behavior={isAndroid ? '' : 'padding'}>
          {(slate && (
            <React.Fragment>
              <Title>{`Incoming ${hrGrin(slate.amount)}`}</Title>
              <View
                style={{
                  flex: 1,
                }}>
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
  txReceive: (slatePath) => {
    dispatch({
      type: 'TX_RECEIVE_REQUEST',
      slatePath,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Receive)
