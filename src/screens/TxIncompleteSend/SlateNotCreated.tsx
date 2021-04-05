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

import BigNumber from 'bignumber.js'
import React, { useEffect, useState } from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import FeatherIcon from 'react-native-vector-icons/Feather'
import {
  ActivityIndicator,
  View,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { useSelector } from 'src/common/redux'
import { Text, Button } from 'src/components/CustomFont'
import { OutputStrategy } from 'src/common/types'
import NumericInput from 'src/components/NumericInput'
import {
  FILE_TRANSPORT_METHOD,
  ADDRESS_TRANSPORT_METHOD,
  hrGrin,
  hrFiat,
  convertToFiat,
  Spacer,
} from 'src/common'
import Notice from 'src/components/Notice'
import { isTxFormInvalid } from 'src/modules/tx'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { currencySelector, currencyRatesSelector } from 'src/modules/settings'
import FormTextInput from 'src/components/FormTextInput'
import { useNavigation } from '@react-navigation/native'
import {
  slightlyTransparent,
  styleSheetFactory,
  useThemedStyles,
} from 'src/themes'

function isZero(v: string) {
  return new BigNumber(v).isZero()
}

const SlateNotCreated = () => {
  const [styles, theme] = useThemedStyles(themedStyles)
  const dispatch = useDispatch()
  const navigation = useNavigation()

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

  const isSending = useSelector((state) => state.tx.txSend.inProgress)

  const send = (
    amount: number,
    address: string,
    outputStrategy: OutputStrategy,
  ) => {
    if (outputStrategy) {
      const { selectionStrategyIsUseAll } = outputStrategy

      if (address && transportMethod === ADDRESS_TRANSPORT_METHOD) {
        dispatch({
          type: 'TX_SEND_ADDRESS_REQUEST',
          amount,
          address,
          selectionStrategyIsUseAll,
        })
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
  if (!isZero(balance.amountCurrentlySpendable)) {
    noticeText = `You can send up to ${hrGrin(
      balance.amountCurrentlySpendable,
    )} including fee`
  } else {
    noticeText = `You don't have any funds available`
  }
  if (!isZero(balance.amountLocked)) {
    noticeText += ` because ${hrGrin(
      balance.amountLocked,
    )} is locked for unconfirmed transactions`
  }
  if (!isZero(balance.amountAwaitingConfirmation)) {
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
      }}
      extraScrollHeight={Platform.select({
        android: 0,
        ios: 88,
      })}>
      <Notice>{noticeText}</Notice>
      {!isZero(balance.amountCurrentlySpendable) && (
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
              color={theme.onBackground}
            />
          ))}
      </View>
      {(outputStrategies.length && (
        <>
          <Text style={styles.title}>Network fee</Text>
          {outputStrategies.map((os, i) => (
            <TouchableOpacity
              style={styles.option}
              key={i}
              onPress={() => {
                setOutputStrategy(os)
              }}>
              <FeatherIcon
                name={os === outputStrategy ? 'check-circle' : 'circle'}
                size={16}
                style={styles.optioIcon}
              />
              <Text style={styles.fee}>{hrGrin(os.fee)}</Text>
              <Text style={styles.locked}>
                {balance.amountCurrentlySpendable === os.total
                  ? `All the funds would be locked for around ${minimumConfirmations} min.`
                  : `${hrGrin(
                      os.total,
                    )} would be locked for around ${minimumConfirmations} min.`}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.title}>Send via?</Text>
          <Spacer />
          <View style={styles.transportMethods}>
            <TouchableOpacity
              style={styles.transportMethod}
              onPress={() => {
                setAddress('')
                setTransportMethod(ADDRESS_TRANSPORT_METHOD)
              }}>
              <FeatherIcon
                name={
                  transportMethod === ADDRESS_TRANSPORT_METHOD
                    ? 'check-circle'
                    : 'circle'
                }
                size={16}
                style={styles.optioIcon}
              />
              <Text style={styles.transportMethodTitle}>Address</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.transportMethod}
              onPress={() => setTransportMethod(FILE_TRANSPORT_METHOD)}>
              <FeatherIcon
                name={
                  transportMethod === FILE_TRANSPORT_METHOD
                    ? 'check-circle'
                    : 'circle'
                }
                size={16}
                style={styles.optioIcon}
              />
              <Text style={styles.transportMethodTitle}>Manual</Text>
            </TouchableOpacity>
          </View>
          {transportMethod === ADDRESS_TRANSPORT_METHOD && (
            <>
              <FormTextInput
                autoFocus={false}
                onChange={(address) => setAddress(address)}
                value={address}
                placeholder="grin......."
                autoCorrect={false}></FormTextInput>
              {!address && (
                <TouchableOpacity
                  style={styles.scanQR}
                  onPress={() =>
                    navigation.navigate('ScanQRCode', {
                      label: 'Grin Address',
                      nextScreen: 'TxIncompleteSend',
                    })
                  }>
                  <MaterialCommunityIcons
                    name="qrcode-scan"
                    size={26}
                    color={theme.onSurface}
                  />
                </TouchableOpacity>
              )}
              <Spacer />
            </>
          )}
          <Button
            title={
              isSending ? (
                <ActivityIndicator
                  style={styles.sendLoader}
                  size="small"
                  color={theme.onBackground}
                />
              ) : (
                'Send'
              )
            }
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

const themedStyles = styleSheetFactory((theme) => ({
  locked: {
    fontSize: 13,
    flexWrap: 'wrap',
    flex: 1,
    color: theme.onBackground,
    paddingVertical: 8,
  },
  fee: {
    fontWeight: '600',
    fontSize: 24,
    color: theme.onBackground,
    marginRight: 8,
  },
  optioIcon: {
    marginRight: 8,
    color: theme.onBackground,
  },
  scanQR: {
    marginTop: -46,
    marginBottom: 40,
    alignSelf: 'flex-end',
  },
  transportMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transportMethodTitle: {
    fontSize: 21,
    color: theme.onBackground,
  },
  title: {
    color: theme.onBackground,
    fontSize: 16,
    fontWeight: '600',
  },
  option: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingRight: 16,
  },
  alternativeAmount: {
    color: slightlyTransparent(theme.onBackground),
    fontSize: 18,
    fontWeight: '300',
    textAlign: 'right',
  },
  feeStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  networkFee: {
    fontSize: 14,
    lineHeight: 32,
    color: theme.warning,
  },
  amount: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transportMethods: {
    flexDirection: 'row',
    paddingBottom: 16,
    justifyContent: 'space-around',
  },
  sendLoader: {
    height: 25,
  },
}))

export default SlateNotCreated
