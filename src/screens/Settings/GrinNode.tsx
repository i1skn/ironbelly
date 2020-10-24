/**
 * Copyright 2019 Ironbelly Devs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { KeyboardAvoidingWrapper, Spacer } from 'src/common'
import FormTextInput from 'src/components/FormTextInput'
import { State as ReduxState, Dispatch } from 'src/common/types'
import { apiSecretFilePath } from 'src/modules/settings'
import RNFS from 'react-native-fs'
import { store } from 'src/common/redux'
import { NavigationProps } from 'src/common/types'

interface OwnProps {
  nodeUrl: string
  setNodeUrl: (nodeUrl: string) => void
  setApiSecret: (apiSecret: string) => void
}

type Props = NavigationProps<'SettingsGrinNode'> & OwnProps

type State = {
  apiSecret?: string
  nodeUrl?: string
}

class GrinNode extends Component<Props, State> {
  async componentDidMount() {
    try {
      const apiSecret = await RNFS.readFile(apiSecretFilePath, 'utf8')
      this.setState({
        apiSecret,
      })
    } catch (e) {
      this.setState({
        apiSecret: '',
      })
    }
  }

  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    // Re-run the filter whenever the list array or filter text change.
    // Note we need to store prevPropsList and prevFilterText to detect changes.
    const apiSecretAfterReset = props.route.params?.apiSecret

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
          onChange={(nodeUrl) => setNodeUrl(nodeUrl)}
          value={nodeUrl}
          placeholder="URL"
          autoCorrect={false}
          title="URL"
        />
        <Spacer />
        <FormTextInput
          autoFocus={false}
          onChange={(apiSecret) =>
            this.setState({
              apiSecret,
            })
          }
          onBlur={() => {
            if (apiSecret != undefined) {
              setApiSecret(apiSecret)
            }
          }}
          value={apiSecret ?? ''}
          placeholder="None"
          autoCorrect={false}
          title="Secret"
        />
      </KeyboardAvoidingWrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  nodeUrl: state.settings.checkNodeApiHttpAddr,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setNodeUrl: (checkNodeApiHttpAddr: string) => {
    dispatch({
      type: 'SET_SETTINGS',
      newSettings: {
        checkNodeApiHttpAddr,
      },
    })
  },
  setApiSecret: (apiSecret: string) => {
    dispatch({
      type: 'SET_API_SECRET',
      apiSecret,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(GrinNode)
