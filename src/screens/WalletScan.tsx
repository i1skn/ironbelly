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
import { ActivityIndicator } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import { Spacer, LoaderView } from 'src/common'
import colors from 'src/common/colors'
import { State as ReduxState, Navigation } from 'src/common/types'
import { Text, Button } from 'src/components/CustomFont'
import { RECOVERY_LIMIT, WalletScanState } from 'src/modules/wallet'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import KeepAwake from 'react-native-keep-awake'
type Props = WalletScanState & {
  navigation: Navigation
  startScanOutputs: () => void
  resetScan: () => void
}
const StatusText = styled(Text)`
  font-size: 24;
`
const ProgressText = styled(Text)`
  font-size: 28;
`
const Wrapper = styled(LoaderView)`
  padding: 16px;
`

class WalletScan extends Component<Props, {}> {
  static navigationOptions = {
    header: null,
  }
  onFinish = () => {
    this.props.navigation.navigate('Main')
    this.props.resetScan()
  }

  componentDidMount() {
    const { startScanOutputs, inProgress } = this.props

    if (inProgress) {
      startScanOutputs()
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.error.message && !prevProps.error.message) {
      this.onFinish()
    }
  }

  render() {
    const { navigation, isDone, inProgress, progress, resetScan } = this.props
    return (
      <Wrapper>
        <KeepAwake />
        {(isDone && (
          <>
            <StatusText>Your wallet is ready to use!</StatusText>
            <Spacer />
            <Button
              testID="ShowMeButton"
              title="Show me"
              disabled={false}
              onPress={this.onFinish}
            />
          </>
        )) || (
          <Fragment>
            {(inProgress && (
              <Fragment>
                <AnimatedCircularProgress
                  style={{
                    alignSelf: 'center',
                  }}
                  size={120}
                  backgroundWidth={4}
                  width={6}
                  fill={progress}
                  tintColor={colors.black}
                  rotation={0}
                  duration={100}
                  backgroundColor={colors.primary}>
                  {fill => <ProgressText>{`${progress}%`}</ProgressText>}
                </AnimatedCircularProgress>
                <Spacer />
                <StatusText
                  style={{
                    textAlign: 'center',
                  }}>
                  Syncing...
                </StatusText>
              </Fragment>
            )) || <ActivityIndicator size="large" color={colors.primary} />}
          </Fragment>
        )}
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({ ...state.wallet.walletScan })

const mapDispatchToProps = (dispatch, ownProps) => ({
  startScanOutputs: () => {
    dispatch({
      type: 'WALLET_SCAN_OUTPUTS_REQUEST',
    })
  },
  resetScan: () => {
    dispatch({
      type: 'WALLET_SCAN_RESET',
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(WalletScan)
