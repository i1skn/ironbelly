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

import { colors, isWalletInitialized, LoaderView } from 'common'
import { type State as ReduxState, type Currency, type Error, type Navigation } from 'common/types'

type Props = {
  settings: {
    currency: Currency,
  },
  error: Error,
  isCreated: boolean,
  navigation: Navigation,
}
type State = {
  inputValue: string,
  amount: number,
  valid: boolean,
}

class Initial extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  state = {
    inputValue: '',
    amount: 0,
    valid: false,
  }

  componentDidMount() {
    const { navigation } = this.props
    isWalletInitialized().then(exists => {
      if (exists) {
        navigation.navigate('Password', { nextScreen: { name: 'Main' } })
      } else {
        navigation.navigate('WalletCreate')
      }
    })
  }

  componentDidUpdate(prevProps) {}

  render() {
    return (
      <LoaderView>
        <ActivityIndicator size="large" color={colors.primary} />
      </LoaderView>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  settings: state.settings,
})

const mapDispatchToProps = (dispatch, ownProps) => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Initial)
