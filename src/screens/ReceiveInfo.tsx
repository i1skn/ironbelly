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
import { FlatList } from 'react-native'
import SettingsListItem, { Props as SettingsItem } from 'src/components/SettingsListItem'
import { connect } from 'react-redux'
import { State as GlobalState, Navigation, Slate } from 'src/common/types'
import { Text } from 'src/components/CustomFont'
import { isAndroid, Spacer } from 'src/common'
import styled from 'styled-components/native'
import colors from 'src/common/colors'
import receiveFromAnotherPersonGuide from 'src/documents/receive-from-another-person'
import { HeaderBackButton } from 'react-navigation'
type Props = {
  navigation: Navigation
  txReceive: (slatePath: string) => void
  slateRequest: (slatePath: string) => void
  isReceived: boolean
  slate: Slate | undefined | null
}
type State = {}
const TextBox = styled.View`
  padding: 16px;
`

class Receive extends Component<Props, State> {
  static navigationOptions = {
    title: 'Receive',
    headerLeft: ({ scene }) => {
      return (
        <HeaderBackButton
          tintColor={colors.black}
          backTitleVisible={!isAndroid}
          onPress={() => scene.descriptor.navigation.goBack(null)}
        />
      )
    },
  }
  state = {}

  componentDidMount() {}

  componentDidUpdate(prevProps) {}

  render() {
    const listData = [
      // { key: 'currency', title: 'Currency', value: 'EUR', onPress: () => {} },
      {
        key: 'receive_from_another_wallet',
        title: 'Receive from another person',
        onPress: () => {
          this.props.navigation.navigate('ReceiveGuide', {
            guide: receiveFromAnotherPersonGuide,
          })
        },
      },
      {
        key: 'more',
        title: 'More guides are coming . . .',
        hideChevron: true,
        titleStyle: {
          color: colors.grey[400],
        },
      },
    ]
    return (
      <Fragment>
        <TextBox>
          <Text>
            Grin is different from the other blockchains: to transfer funds both a sender and a
            receiver need to interact.
          </Text>
          <Spacer />
          <Text>Ironbelly at the moment supports only receiving Grin via file.</Text>
          <Spacer />
          <Text>Below you can find some guides on how to receive Grin from different sources</Text>
        </TextBox>
        <FlatList
          style={{
            paddingLeft: 16,
          }}
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
    dispatch({
      type: 'TX_RECEIVE_REQUEST',
      slatePath,
    })
  },
  slateRequest: slatePath => {
    dispatch({
      type: 'SLATE_LOAD_REQUEST',
      slatePath,
      isResponse: false,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Receive)
