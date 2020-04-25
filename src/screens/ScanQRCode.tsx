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
import { processColor, StatusBar } from 'react-native'
import { isAndroid, parseSendLink } from 'src/common'
import colors from 'src/common/colors'
import { State as GlobalState, Navigation } from 'src/common/types'
// import { CameraKitCamera } from 'react-native-camera-kit'
import urlParser from 'url'
import styled from 'styled-components/native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Torch from 'react-native-torch'
type Props = {
  navigation: Navigation
  setFromLink: (amount: number, message: string, url: string) => void
  setHttpAddress: (url: string) => void
}
type State = {
  torch: boolean
}
const Overlay = styled.View`
  flex: 1;
`
const Flashlight = styled.TouchableOpacity`
  align-items: center;
  background: transparent;
  position: absolute;
  bottom: 32;
  left: 50%;
  margin-left: -26px;
`
const Close = styled.TouchableOpacity`
  background: transparent;
  position: absolute;
  top: 16;
  left: 24;
`

class ScanQRCode extends Component<Props, State> {
  static navigationOptions = {
    header: null,
  }
  state = {
    torch: false,
  }
  qrCodeProcessing = false
  _onScanQRCode = url => {
    this.qrCodeProcessing = true
    const { setFromLink, setHttpAddress } = this.props
    const link = urlParser.parse(url, true)

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
      setHttpAddress(url)
      this.props.navigation.goBack()
      this.props.navigation.navigate('Send')
    }

    this.qrCodeProcessing = false
  }

  componentDidUpdate(prevProps: Props) {}

  async componentDidMount() {
    try {
      // const checkResult = await CameraKitCamera.checkDeviceCameraAuthorizationStatus()
      // if (checkResult === -1 && isAndroid) {
      // CameraKitCamera.requestDeviceCameraAuthorization()
      // .then(console.log)
      // .catch(console.log)
      // }
    } catch (e) {
      console.log(e)
    }
  }

  async componentWillUnmount(prevProps: Props) {
    try {
      await Torch.switchState(false)
    } catch (e) {
      console.log(e)
    }
  }

  // <CameraKitCamera
  // style={{
  // flex: 1,
  // justifyContent: 'flex-end',
  // }}
  // cameraOptions={{
  // focusMode: 'on',
  // zoomMode: 'on',
  // }}
  // showFrame={true}
  // scanBarcode={true}
  // onReadCode={event => {
  // const { codeStringValue } = event.nativeEvent

  // if (!this.qrCodeProcessing) {
  // this._onScanQRCode(codeStringValue)
  // }
  // }}
  // scannerOptions={{
  // offsetFrame: 30,
  // frameHeight: 300,
  // colorForFrame: processColor(colors.red[600]),
  // }}
  // />

  render() {
    const { navigation } = this.props
    const { torch } = this.state
    return (
      <Overlay>
        <StatusBar hidden />
        <Flashlight
          onPress={async () => {
            this.setState({
              torch: !torch,
            })

            try {
              await Torch.switchState(!torch)
            } catch (e) {
              console.log(e)
            }
          }}>
          <MaterialCommunityIcons
            color={colors.white}
            name={torch ? 'flashlight' : 'flashlight-off'}
            size={52}
          />
        </Flashlight>
        <Close onPress={() => navigation.goBack()}>
          <Ionicons color={colors.white} name="ios-close" size={52} />
        </Close>
      </Overlay>
    )
  }
}

const mapStateToProps = (state: GlobalState) => ({})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setFromLink: (amount, message, url) =>
    dispatch({
      type: 'TX_FORM_SET_FROM_LINK',
      amount,
      textAmount: amount ? (amount / 1e9).toString() : '',
      message,
      url,
    }),
  setHttpAddress: url =>
    dispatch({
      type: 'TX_FORM_SET_URL',
      url,
    }),
})

export default connect(mapStateToProps, mapDispatchToProps)(ScanQRCode)
