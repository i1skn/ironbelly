/**
 * Copyright 2020 Ironbelly Devs
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

import React, { useEffect, useState } from 'react'

import FeatherIcon from 'react-native-vector-icons/Feather'
import styled from 'styled-components/native'
import colors from 'src/common/colors'
import { ActivityIndicator, View, Platform, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
import { useSelector } from 'src/common/redux'
import { Text, Button } from 'src/components/CustomFont'
import { OutputStrategy } from 'src/common/types'
import NumericInput from 'src/components/NumericInput'
import {
  FILE_TRANSPORT_METHOD,
  ADDRESS_TRANSPORT_METHOD,
  HTTP_TRANSPORT_METHOD,
  hrGrin,
  hrFiat,
  convertToFiat,
  Spacer,
  Notice,
} from 'src/common'
import { isTxFormInvalid } from 'src/modules/tx'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { currencySelector, currencyRatesSelector } from 'src/modules/settings'
import FormTextInput from 'src/components/FormTextInput'

type SlateNotCreateProps = {}

const TransportMethod = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`

const TransportMethodTitle = styled.Text<{ active: boolean }>`
  font-size: 21;
  color: ${(props) => (props.active ? colors.black : colors.grey[700])};
`

const Title = styled.Text`
  color: ${colors.grey[700]};
  font-size: 16;
  font-weight: 600;
  padding-bottom: 8;
  padding-top: 8;
`

const Option = styled.TouchableOpacity`
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  padding: 0 0 16px 0;
`
const OptioIcon = styled(FeatherIcon).attrs((props) => ({
  // @ts-ignore
  name: props.active ? 'check-circle' : 'circle',
  size: 16,
}))<{ active: boolean }>`
  margin-right: 8px;
  color: ${(props) => (props.active ? colors.black : colors.grey[700])};
`
const Fee = styled.Text<{ active: boolean }>`
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

const SlateNotCreated = ({}: SlateNotCreateProps) => {
  const dispatch = useDispatch()
  const setAmount = (amount: number, textAmount: string) => {
    dispatch({
      type: 'TX_FORM_SET_AMOUNT',
      amount,
      textAmount,
    })
  }
  const setOutputStrategy = (outputStrategy: OutputStrategy) => {
    dispatch({
      type: 'TX_FORM_SET_OUTPUT_STRATEGY',
      outputStrategy,
    })
  }

  const setAddress = (address: string) => {
    dispatch({
      type: 'TX_FORM_SET_ADDRESS',
      address: address.toLowerCase(),
    })
  }

  const send = (
    amount: number,
    address: string,
    outputStrategy: OutputStrategy,
  ) => {
    if (outputStrategy) {
      const { selectionStrategyIsUseAll } = outputStrategy

      if (address) {
        if (transportMethod === ADDRESS_TRANSPORT_METHOD) {
          dispatch({
            type: 'TX_SEND_ADDRESS_REQUEST',
            amount,
            address,
            selectionStrategyIsUseAll,
          })
        } else if (transportMethod === HTTP_TRANSPORT_METHOD) {
          dispatch({
            type: 'TX_SEND_HTTPS_REQUEST',
            amount,
            url: address,
            selectionStrategyIsUseAll,
          })
        }
      } else {
        dispatch({
          type: 'TX_CREATE_REQUEST',
          amount,
          selectionStrategyIsUseAll,
        })
      }
    }
  }

  const balance = useSelector((state) => state.balance)
  const minimumConfirmations = useSelector(
    (state) => state.settings.minimumConfirmations,
  )
  const currency = useSelector(currencySelector)
  const currencyRates = useSelector(currencyRatesSelector)
  const txForm = useSelector((state) => state.tx.txForm)
  const {
    textAmount,
    address,
    amount,
    outputStrategy,
    outputStrategies,
    outputStrategies_error,
    outputStrategies_inProgress,
  } = txForm
  const [transportMethod, setTransportMethod] = useState(
    ADDRESS_TRANSPORT_METHOD,
  )
  useEffect(() => {
    if (amount) {
      dispatch({
        type: 'TX_FORM_OUTPUT_STRATEGIES_REQUEST',
        amount,
      })
    } else {
      dispatch({
        type: 'TX_FORM_OUTPUT_STRATEGIES_SUCCESS',
        outputStrategies: [],
      })
    }
  }, [amount])

  let noticeText

  if (balance.amountCurrentlySpendable) {
    noticeText = `You can send up to ${hrGrin(
      balance.amountCurrentlySpendable,
    )}`
  } else {
    noticeText = `You don't have any funds available`
  }
  if (balance.amountLocked) {
    noticeText += ` because ${hrGrin(
      balance.amountLocked,
    )} is locked for unconfirmed transactions`
  }
  if (balance.amountAwaitingConfirmation) {
    noticeText +=
      (balance.amountLocked ? ' and' : ' because') +
      ` ${hrGrin(
        balance.amountAwaitingConfirmation,
      )} is not older than ${minimumConfirmations} confirmations`
  }

  return (
    <KeyboardAwareScrollView
      keyboardDismissMode={'on-drag'}
      keyboardShouldPersistTaps="always"
      contentContainerStyle={{
        ...Platform.select({
          android: { paddingVertical: 16 },
          ios: { paddingBottom: 64 },
        }),
        paddingHorizontal: 16,
      }}>
      <Notice>{noticeText}</Notice>
      {!!balance.amountCurrentlySpendable && (
        <View style={styles.amount}>
          <NumericInput
            autoFocus={!amount}
            onChange={(value: string) => {
              const amount = parseFloat(value.replace(/,/, '.') || '0')

              if (!isNaN(amount) && amount) {
                setAmount(amount * 1e9, value)
              } else {
                setAmount(0, value)
              }
            }}
            placeholder="0"
            value={textAmount}
            maxLength={100000}
            units={'ツ'}
          />
          <Text style={styles.alternativeAmount}>
            {hrFiat(
              convertToFiat(amount, currency, currencyRates.rates),
              currency,
            )}
          </Text>
        </View>
      )}
      <View style={styles.feeStatus}>
        {false && (
          <Text style={styles.available}>{`Available: ${hrGrin(amount)}`}</Text>
        )}
        {(!!outputStrategies_error && (
          <Text style={styles.networkFee}>{outputStrategies_error}</Text>
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
          <View style={styles.transportMethods}>
            <TransportMethod
              style={styles.transportMethod}
              onPress={() => {
                setAddress('')
                setTransportMethod(ADDRESS_TRANSPORT_METHOD)
              }}>
              <OptioIcon
                active={transportMethod === ADDRESS_TRANSPORT_METHOD}
              />
              <TransportMethodTitle
                active={transportMethod === ADDRESS_TRANSPORT_METHOD}>
                Address
              </TransportMethodTitle>
            </TransportMethod>
            <TransportMethod
              style={styles.transportMethod}
              onPress={() => setTransportMethod(FILE_TRANSPORT_METHOD)}>
              <OptioIcon active={transportMethod === FILE_TRANSPORT_METHOD} />
              <TransportMethodTitle
                active={transportMethod === FILE_TRANSPORT_METHOD}>
                File
              </TransportMethodTitle>
            </TransportMethod>
            <TransportMethod
              style={styles.transportMethod}
              onPress={() => {
                setAddress('')
                setTransportMethod(HTTP_TRANSPORT_METHOD)
              }}>
              <OptioIcon active={transportMethod === HTTP_TRANSPORT_METHOD} />
              <TransportMethodTitle
                active={transportMethod === HTTP_TRANSPORT_METHOD}>
                HTTP(S)
              </TransportMethodTitle>
            </TransportMethod>
          </View>
          {transportMethod === ADDRESS_TRANSPORT_METHOD && (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <FormTextInput
                  autoFocus={false}
                  onChange={(address) => setAddress(address)}
                  value={address}
                  placeholder="grin......."
                  autoCorrect={false}
                />
              </View>
              <Spacer />
            </>
          )}
          {transportMethod === HTTP_TRANSPORT_METHOD && (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <FormTextInput
                  autoFocus={false}
                  onChange={(url) => setAddress(url)}
                  value={address}
                  placeholder="http(s)://"
                  textContentType={'URL'}
                  keyboardType={'url'}
                  autoCorrect={false}
                  multiline={true}
                />
              </View>
              <Spacer />
            </>
          )}
          <Button
            title={'Send'}
            onPress={() => {
              if (outputStrategy) {
                send(amount, address, outputStrategy)
              }
            }}
            disabled={isTxFormInvalid(txForm, transportMethod)}
          />
          <Spacer />
        </>
      )) ||
        null}
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  alternativeAmount: {
    color: colors.onBackgroundLight,
    fontSize: 18,
    fontWeight: '300',
    textAlign: 'right',
  },
  feeStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  available: {
    color: colors.grey[500],
    fontSize: 14,
    height: 24,
  },
  networkFee: {
    fontSize: 14,
    lineHeight: 32,
    color: colors.red[500],
  },
  amount: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transportMethod: {
    flexDirection: 'row',
  },
  transportMethods: {
    flexDirection: 'row',
    paddingBottom: 16,
    justifyContent: 'space-around',
  },
})

export default SlateNotCreated
