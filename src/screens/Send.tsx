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
import React, { useState, useMemo } from 'react'
import { ActivityIndicator, View } from 'react-native'
import Header from 'src/components/Header'
import { TouchableOpacity } from 'react-native'
import NumericInput from 'src/components/NumericInput'
import FormTextInput from 'src/components/FormTextInput'
import FeatherIcon from 'react-native-vector-icons/Feather'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { connect } from 'react-redux'
import { debounce } from 'debounce'
import {
  Balance,
  Currency,
  State as GlobalState,
  Navigation,
  Slate,
  OutputStrategy,
} from 'src/common/types'
import { Button } from 'src/components/CustomFont'
import {
  FILE_TRANSPORT_METHOD,
  HTTP_TRANSPORT_METHOD,
  hrGrin,
  hrFiat,
  convertToFiat,
  Spacer,
  isAndroid,
} from 'src/common'
import styled from 'styled-components/native'
import colors from 'src/common/colors'
import { TxForm, isTxFormValid } from 'src/modules/tx'
import { State as CurrencyRatesState } from 'src/modules/currency-rates'
import CloseImg from 'src/assets/images/x.png'

const UnderNote = styled.Text`
  font-size: 12;
  font-weight: 300;
  color: ${colors.grey[700]};
  padding-top: 4;
  padding-bottom: 8;
`
const ScanQRCode = styled.TouchableOpacity`
  margin-left: -26px;
`
const TransportMethod = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`
const TransportMethodTitle = styled.Text`
  font-size: 24;
  color: ${(props) => (props.active ? colors.black : colors.grey[700])};
`
const AlternativeAmount = styled.Text`
  color: ${colors.grey[700]};
  font-size: 18;
  text-align: right;
  text-align: right;
  height: 50;
  line-height: 50;
  margin-left: 2;
`
const Title = styled.Text`
  color: ${colors.grey[700]};
  font-size: 16;
  font-weight: 600;
  padding-bottom: 8;
  padding-top: 8;
`
const NetworkFeeError = styled.Text`
  font-size: 14;
  line-height: 32;
  color: ${colors.red[500]};
`
const Available = styled.Text`
  color: ${colors.grey[500]};
  font-size: 14;
  height: 24;
`
const Amount = styled(NumericInput)``
const Option = styled.TouchableOpacity`
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  padding: 0 0 16px 0;
`
const OptioIcon = styled(FeatherIcon).attrs((props) => ({
  name: props.active ? 'check-circle' : 'circle',
  size: 16,
}))`
  margin-right: 8px;
  color: ${(props) => (props.active ? colors.black : colors.grey[700])};
`
const Fee = styled.Text`
  font-weight: 600;
  font-size: 24;
  color: ${(props) => (props.active ? colors.black : colors.grey[700])};
`
const Locked = styled.Text`
  font-size: 13;
  flex-wrap: wrap;
  flex: 1;
  color: ${colors.grey[700]};
  padding: 0 0 0 8px;
`

const Send = ({
  setOutputStrategy,
  setUrl,
  balance,
  setAmount,
  getOutputStrategies,
  resetOutputStrategies,
  txForm,
  currency,
  currencyRates,
  minimumConfirmations,
  send,
  navigation,
  isSent,
  isCreated,
}: Props) => {
  const {
    textAmount,
    url,
    amount,
    message,
    outputStrategy,
    outputStrategies,
    outputStrategies_error,
    outputStrategies_inProgress,
  } = txForm
  const [transportMethod, setTransportMethod] = useState(
    url ? HTTP_TRANSPORT_METHOD : FILE_TRANSPORT_METHOD,
  )
  useMemo(() => {
    if (isCreated || isSent) {
      navigation.goBack()
    }
  }, [isCreated, isSent, navigation])
  useMemo(() => {
    if (amount) {
      getOutputStrategies(amount)
    } else {
      resetOutputStrategies()
    }
  }, [amount, getOutputStrategies, resetOutputStrategies])
  return (
    <>
      <Header
        leftIcon={CloseImg}
        leftText={'Cancel'}
        leftAction={() => navigation.navigate('Overview')}
      />

      <KeyboardAwareScrollView
        style={{
          paddingLeft: 16,
          paddingRight: 16,
        }}
        keyboardShouldPersistTaps={'handled'}
        extraScrollHeight={8}
        enableResetScrollToCoords={false}
        keyboardOpeningTime={0}
        keyboardDismissMode={'on-drag'}>
        <View
          style={{
            flex: 1,
          }}>
          <Spacer />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Amount
              autoFocus={!amount}
              onChange={(value: string) => {
                const amount = parseFloat(value.replace(/,/, '.') || '0')

                if (!isNaN(amount) && amount) {
                  setAmount(amount * 1e9, value)
                } else {
                  setAmount(0, value)
                }
              }}
              placeholder="Amount"
              value={textAmount}
              maxLength={100000}
              units={'ツ'}
            />
            <AlternativeAmount>
              ≈{' '}
              {hrFiat(
                convertToFiat(
                  amount + (outputStrategy ? outputStrategy.fee : 0),
                  currency,
                  currencyRates.rates,
                ),
                currency,
              )}
            </AlternativeAmount>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              paddingBottom: 8,
            }}>
            {false && <Available>{`Available: ${hrGrin(amount)}`}</Available>}
            {(!!outputStrategies_error && (
              <NetworkFeeError>{outputStrategies_error}</NetworkFeeError>
            )) ||
              (outputStrategies_inProgress && (
                <ActivityIndicator
                  style={{
                    paddingTop: 6,
                    paddingBottom: 6,
                  }}
                  size="small"
                  color={colors.grey[700]}
                />
              ))}
          </View>
          {(outputStrategies.length && (
            <>
              <Title>Network fee</Title>
              <Spacer />
              {outputStrategies.map((os, i) => (
                <Option
                  key={i}
                  onPress={() => {
                    setOutputStrategy(os)
                  }}>
                  <OptioIcon active={os === outputStrategy} />
                  <Fee active={os === outputStrategy}>{hrGrin(os.fee)}</Fee>
                  {balance.amountCurrentlySpendable === os.total ? (
                    <Locked>
                      All the funds would be locked for around{' '}
                      {minimumConfirmations} min.
                    </Locked>
                  ) : (
                    <Locked>
                      {hrGrin(os.total)} would be locked for around{' '}
                      {minimumConfirmations} min.
                    </Locked>
                  )}
                </Option>
              ))}
              <Title>Send via?</Title>
              <Spacer />
              <View
                style={{
                  flexDirection: 'row',
                  paddingBottom: 16,
                  justifyContent: 'space-around',
                }}>
                <TransportMethod
                  style={{
                    flexDirection: 'row',
                  }}
                  onPress={() => setTransportMethod(FILE_TRANSPORT_METHOD)}>
                  <OptioIcon
                    active={transportMethod === FILE_TRANSPORT_METHOD}
                  />
                  <TransportMethodTitle
                    active={transportMethod === FILE_TRANSPORT_METHOD}>
                    File
                  </TransportMethodTitle>
                </TransportMethod>
                <TransportMethod
                  style={{
                    flexDirection: 'row',
                  }}
                  onPress={() => setTransportMethod(HTTP_TRANSPORT_METHOD)}>
                  <OptioIcon
                    active={transportMethod === HTTP_TRANSPORT_METHOD}
                  />
                  <TransportMethodTitle
                    active={transportMethod === HTTP_TRANSPORT_METHOD}>
                    HTTP(S)
                  </TransportMethodTitle>
                </TransportMethod>
              </View>
              <Spacer />
              {transportMethod === HTTP_TRANSPORT_METHOD && (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <FormTextInput
                      autoFocus={false}
                      onChange={(url) => setUrl(url)}
                      value={url}
                      placeholder="http(s)://"
                      textContentType={'URL'}
                      keyboardType={'url'}
                      autoCorrect={false}
                      multiline={true}
                    />
                    {false && !url && (
                      <ScanQRCode
                        onPress={() => navigation.navigate('ScanQRCode')}>
                        <MaterialCommunityIcons name="qrcode-scan" size={26} />
                      </ScanQRCode>
                    )}
                  </View>
                  <Spacer />
                </>
              )}
              <Button
                title={'Send'}
                onPress={() => {
                  send(amount, message, url, outputStrategy)
                }}
                disabled={isTxFormValid(txForm, transportMethod)}
              />
              <Spacer />
            </>
          )) ||
            null}
        </View>
      </KeyboardAwareScrollView>
    </>
  )
}

Send.navigationOptions = {
  title: 'Send',
}

const mapStateToProps = (state: GlobalState) => {
  return {
    currency: state.settings.currencyObject,
    txForm: state.tx.txForm,
    currencyRates: state.currencyRates,
    balance: state.balance,
    minimumConfirmations: state.settings.minimumConfirmations,
    isCreated: state.tx.txCreate.created,
    isSent: state.tx.txSend.sent,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  setAmount: (amount: number, textAmount: string) => {
    dispatch({
      type: 'TX_FORM_SET_AMOUNT',
      amount,
      textAmount,
    })
  },
  getOutputStrategies: debounce((amount) => {
    dispatch({
      type: 'TX_FORM_OUTPUT_STRATEGIES_REQUEST',
      amount,
    })
  }, 500),
  resetOutputStrategies: debounce((amount) => {
    dispatch({
      type: 'TX_FORM_OUTPUT_STRATEGIES_SUCCESS',
      outputStrategies: [],
    })
  }, 100),
  setOutputStrategy: (outputStrategy) => {
    dispatch({
      type: 'TX_FORM_SET_OUTPUT_STRATEGY',
      outputStrategy,
    })
  },
  setUrl: (url: string) => {
    dispatch({
      type: 'TX_FORM_SET_URL',
      url: url.toLowerCase(),
    })
  },
  send: (amount, message, url, outputStrategy) => {
    if (outputStrategy) {
      const { selectionStrategyIsUseAll } = outputStrategy

      if (url) {
        dispatch({
          type: 'TX_SEND_HTTPS_REQUEST',
          amount,
          message,
          url,
          selectionStrategyIsUseAll,
        })
      } else {
        dispatch({
          type: 'TX_CREATE_REQUEST',
          amount,
          message,
          selectionStrategyIsUseAll,
        })
      }
    }
  },
})

type Props = {
  navigation: Navigation
  txReceive: (slatePath: string) => void
  slateRequest: (slatePath: string) => void
  isReceived: boolean
  slate: Slate | undefined | null
  setAmount: (amount: number, textAmount: string) => void
  txForm: TxForm
  currency: Currency
  currencyRates: CurrencyRatesState
  setOutputStrategy: (outputStrategy: OutputStrategy) => void
  getOutputStrategies: (amount: number) => void
  resetOutputStrategies: () => void
  balance: Balance
  minimumConfirmations: number
  setUrl: (url: string) => void
  send: (
    amount: number,
    message: string,
    url: string,
    outputStrategy?: OutputStrategy | null,
  ) => void
  isCreated: boolean
  isSent: boolean
}
export default connect(mapStateToProps, mapDispatchToProps)(Send)
