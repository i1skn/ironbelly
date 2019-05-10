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

import React, { Component, Fragment } from 'react'
import { FlatList, View } from 'react-native'
import SettingsListItem, { type Props as SettingsItem } from 'components/SettingsListItem'

import { connect } from 'react-redux'

import { type State as GlobalState, type Navigation, type Slate } from 'common/types'

type Props = {
  navigation: Navigation,
  txReceive: (slatePath: string) => void,
  slateRequest: (slatePath: string) => void,
  isReceived: boolean,
  slate: ?Slate,
}

type State = {}

class Receive extends Component<Props, State> {
  static navigationOptions = {
    title: 'Receive',
    headerBackImage: <View style={{ width: 12 }} />,
  }

  state = {}

  componentDidMount() {}
  componentDidUpdate(prevProps) {}
  render() {
    const listData = [
      // { key: 'currency', title: 'Currency', value: 'EUR', onPress: () => {} },
      {
        key: 'from_another_wallet',
        title: 'From another wallet',
        onPress: () => {},
      },
    ]
    return (
      <Fragment>
        <FlatList
          style={{ paddingLeft: 16 }}
          data={listData}
          renderItem={({ item }: { item: SettingsItem }) => <SettingsListItem {...item} />}
        />
      </Fragment>
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
