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
import { ScrollView, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import { Spacer } from 'common'
import { appFont, Button } from 'components/CustomFont'
import { type State as ReduxState, type Error, type Navigation } from 'common/types'
import Markdown, { styles as markdownDefaultStyles } from 'react-native-markdown-renderer'
import legalDisclaimer from 'documents/legal-disclaimer'

type Props = {
  accept: (buildNumber: number) => void,
  acceptedBuildNumber: number,
  navigation: Navigation,
}

type State = {}

const Wrapper = styled.View`
  flex: 1;
`

const markdownStyles = StyleSheet.create({
  heading1: {
    fontSize: 24,
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
    fontFamily: appFont,
  },
})
class LegalDisclaimer extends Component<Props, State> {
  state = {}
  static fromBuildNumber = 11
  static navigationOptions = {
    title: 'Legal Disclaimer',
  }

  componentDidUpdate() {
    const { acceptedBuildNumber, navigation } = this.props
    const { nextScreen, alreadyAccepted } = navigation.state.params

    if (!alreadyAccepted && acceptedBuildNumber >= LegalDisclaimer.fromBuildNumber) {
      navigation.replace(nextScreen.name, nextScreen.params)
    }
  }

  render() {
    const { navigation, accept } = this.props
    const { buildNumber, alreadyAccepted } = navigation.state.params
    return (
      <Wrapper>
        <ScrollView
          style={{
            paddingLeft: 16,
            paddingRight: 16,
          }}
          testID="LegalDisclaimerScrollView"
          showsVerticalScrollIndicator={true}
        >
          <Markdown style={markdownStyles}>{legalDisclaimer}</Markdown>
          <Spacer />
          <Button
            testID="IAgree"
            title={alreadyAccepted ? 'Already accepted' : 'I Agree'}
            disabled={alreadyAccepted}
            onPress={() => {
              accept(buildNumber)
            }}
          />
          <Spacer />
        </ScrollView>
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  acceptedBuildNumber: state.settings.acceptedLegalDisclaimerBuildNumber,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  accept: buildNumber => {
    dispatch({ type: 'ACCEPT_LEGAL_DISCLAIMER', buildNumber })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LegalDisclaimer)
