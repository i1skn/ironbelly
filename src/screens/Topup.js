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

import { Text } from 'components/CustomFont'
import { type State as ReduxState, type Navigation } from 'common/types'
import Header from 'components/Header'

//Images
import CloseImg from 'assets/images/Close.png'

type Props = {
  navigation: Navigation,
}
type State = {}

const Container = styled.View`
  padding: 0 16px;
`

const MainText = styled(Text)`
  font-size: 16;
  margin-bottom: 16;
`

class Topup extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  state = {}

  componentDidMount() {}

  componentDidUpdate(prevProps) {}

  render() {
    return (
      <React.Fragment>
        <Header
          leftIcon={CloseImg}
          leftText={'Close'}
          leftAction={() => this.props.navigation.goBack()}
          title={'Top up'}
        />
        <Container>
          <MainText>
            Grin does not have addresses, so to top up your balance you need to ask somebody to send
            you some Grin via a file.
          </MainText>
          <MainText>
            Then you can open the file, app would automatically performs Grin "magic" on it and
            generates a new file, which you should send back to the sender.
          </MainText>
          <MainText>
            Then the sender opens your response file and confirms the transaction.
          </MainText>
        </Container>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({})

const mapDispatchToProps = (dispatch, ownProps) => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Topup)
