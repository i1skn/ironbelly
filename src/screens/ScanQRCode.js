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

import { parseSendLink } from 'common'
import colors from 'common/colors'
import { type Url, type State as GlobalState, type Navigation } from 'common/types'
import { CameraKitCameraScreen } from 'react-native-camera-kit'
import urlParser from 'url'

type Props = {
  navigation: Navigation,
  setFromLink: (amount: number, message: string, url: string) => void,
}

type State = {}

class ScanQRCode extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }

  qrCodeProcessing = false

  _onScanQRCode = url => {
    this.qrCodeProcessing = true
    const { setFromLink } = this.props
    // $FlowFixMe
    const link: Url = urlParser.parse(url, true)

    if (link.protocol === 'grin:') {
      if (link.host === 'send') {
        const { amount, destination, message } = parseSendLink(link.query)
        if (!isNaN(amount) && destination) {
          setFromLink(amount, message, destination)
          this.props.navigation.goBack()
          this.props.navigation.navigate('Send')
        }
      }
    } else if (['http:', 'https:'].indexOf(link.protocol) !== -1) {
      setFromLink(0, '', url)
      this.props.navigation.goBack()
      this.props.navigation.navigate('Send')
    }
    this.qrCodeProcessing = false
  }
  componentDidUpdate(prevProps) {}
  render() {
    const { navigation } = this.props
    return (
      <CameraKitCameraScreen
        actions={{ leftButtonText: 'Cancel' }}
        onBottomButtonPressed={event => navigation.goBack()}
        scanBarcode={true}
        onReadCode={event => {
          const { codeStringValue } = event.nativeEvent
          if (!this.qrCodeProcessing) {
            this._onScanQRCode(codeStringValue)
          }
        }}
        hideControls={false}
        showFrame={true}
        offsetForScannerFrame={30}
        heightForScannerFrame={300}
        colorForScannerFrame={colors.red[600]}
      />
    )
  }
}

const mapStateToProps = (state: GlobalState) => ({})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setFromLink: (amount, message, url) =>
    dispatch({
      type: 'TX_FORM_SET_FROM_LINK',
      amount,
      textAmount: amount ? amount.toString() : '',
      message,
      url,
    }),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ScanQRCode)
