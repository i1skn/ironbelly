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
import { ScrollView, StyleSheet } from 'react-native'
import { Navigation } from 'src/common/types'
import Markdown, { styles as markdownDefaultStyles } from 'react-native-markdown-renderer'
type Props = {
  navigation: Navigation
}
type State = {}
const markdownStyles = StyleSheet.create({
  heading1: {
    fontSize: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  listUnorderedItemIcon: {
    ...markdownDefaultStyles.listUnorderedItemIcon,
    marginLeft: 0,
    marginRight: 8,
  },
  text: {
    fontSize: 16,
  },
})

class ReceiveGuide extends Component<Props, State> {
  state = {}

  render() {
    return (
      <ScrollView
        style={{
          paddingLeft: 16,
          paddingRight: 16,
        }}
        testID="ReceiveFromAnotherPersonGuide"
        showsVerticalScrollIndicator={true}>
        <Markdown style={markdownStyles}>{this.props.navigation.state.params.guide}</Markdown>
      </ScrollView>
    )
  }
}

export default ReceiveGuide
