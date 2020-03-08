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
import { TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { FlexGrow, KeyboardAvoidingWrapper, Spacer } from 'src/common'
import { Button, Text } from 'src/components/CustomFont'
import styled from 'styled-components/native'
import FormTextInput from 'src/components/FormTextInput'
import { State as ReduxState } from 'src/common/types'
import { apiSecretFilePath } from 'src/modules/settings'
import RNFS from 'react-native-fs'
import { store } from 'src/common/redux'
import {
  MAINNET_CHAIN,
  FLOONET_CHAIN,
  MAINNET_API_SECRET,
  FLOONET_API_SECRET,
} from 'src/modules/settings'
type Props = {
  nodeUrl: string
  setNodeUrl: (nodeUrl: string) => void
  setApiSecret: (apiSecret: string) => void
}
type State = {
  apiSecret: string
  nodeUrl: string
}
const ResetButton = styled.TouchableOpacity`
  padding-right: 16px;
`
const ResetButtonText = styled(Text)`
  font-size: 18px;
  font-weight: 500;
`

class GrinNode extends Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Grin node',
      headerRight: (
        <ResetButton
          onPress={() => {
            const state = store.getState()

            switch (state.settings.chain) {
              case MAINNET_CHAIN:
                store.dispatch({
                  type: 'SWITCH_TO_MAINNET',
                })
                navigation.setParams({
                  apiSecret: MAINNET_API_SECRET,
                })
                break

              case FLOONET_CHAIN:
                store.dispatch({
                  type: 'SWITCH_TO_FLOONET',
                })
                navigation.setParams({
                  apiSecret: FLOONET_API_SECRET,
                })
                break
            }
          }}>
          <ResetButtonText>Reset</ResetButtonText>
        </ResetButton>
      ),
    }
  }
  state = {}

  async componentDidMount() {
    try {
      const apiSecret = await RNFS.readFile(apiSecretFilePath, 'utf8')
      this.setState({
        apiSecret,
      })
    } catch (e) {}
  }

  static getDerivedStateFromProps(props, state) {
    // Re-run the filter whenever the list array or filter text change.
    // Note we need to store prevPropsList and prevFilterText to detect changes.
    const apiSecretAfterReset = props.navigation.getParam('apiSecret')

    if (apiSecretAfterReset && state.apiSecret != apiSecretAfterReset) {
      props.navigation.setParams({
        apiSecret: '',
      })
      store.dispatch({
        type: 'SET_API_SECRET',
        apiSecret: apiSecretAfterReset,
      })
      return {
        apiSecret: apiSecretAfterReset,
      }
    }

    return null
  }

  render() {
    const { nodeUrl, setNodeUrl, setApiSecret } = this.props
    const { apiSecret } = this.state
    return (
      <KeyboardAvoidingWrapper>
        <Spacer />
        <FormTextInput
          autoFocus={false}
          onChange={nodeUrl => setNodeUrl(nodeUrl)}
          value={nodeUrl}
          placeholder="URL"
          autoCorrect={false}
          title="URL"
        />
        <Spacer />
        <FormTextInput
          autoFocus={false}
          onChange={apiSecret =>
            this.setState({
              apiSecret,
            })
          }
          onBlur={() => {
            setApiSecret(apiSecret)
          }}
          value={apiSecret}
          placeholder="API Secret"
          autoCorrect={false}
          title="API Secret"
        />
      </KeyboardAvoidingWrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  nodeUrl: state.settings.checkNodeApiHttpAddr,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setNodeUrl: checkNodeApiHttpAddr => {
    dispatch({
      type: 'SET_SETTINGS',
      newSettings: {
        checkNodeApiHttpAddr,
      },
    })
  },
  setApiSecret: apiSecret => {
    dispatch({
      type: 'SET_API_SECRET',
      apiSecret,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(GrinNode)
