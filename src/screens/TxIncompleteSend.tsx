import React, { useEffect, useRef, useState } from 'react'
import DocumentPicker from 'react-native-document-picker'
import RNFS from 'react-native-fs'
import { SafeAreaView } from 'react-native-safe-area-context'

import FeatherIcon from 'react-native-vector-icons/Feather'
import styled from 'styled-components/native'
import FontAwesome5Icons from 'react-native-vector-icons/FontAwesome5'
import colors from 'src/common/colors'
import {
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { useSelector } from 'src/common/redux'
import { Text, Button, monoSpaceFont } from 'src/components/CustomFont'
import CardTitle from 'src/components/CardTitle'
import { OutputStrategy, Tx } from 'src/common/types'
import { NavigationProps } from 'src/common/types'
import Clipboard from '@react-native-community/clipboard'
import Textarea from 'src/components/Textarea'
import NumericInput from 'src/components/NumericInput'
import {
  FILE_TRANSPORT_METHOD,
  HTTP_TRANSPORT_METHOD,
  hrGrin,
  hrFiat,
  convertToFiat,
  Spacer,
  getSlatePath,
  isValidSlatepack,
} from 'src/common'
import { isTxFormValid } from 'src/modules/tx'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { currencySelector, currencyRatesSelector } from 'src/modules/settings'
import FormTextInput from 'src/components/FormTextInput'

interface OwnProps {
  tx: Tx
}

type Props = NavigationProps<'TxIncompleteSend'> & OwnProps
type SlateCreateProps = {
  slateId: string
} & NavigationProps<'TxIncompleteSend'>

type SlateNotCreateProps = {}

const TransportMethod = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`

const TransportMethodTitle = styled.Text<{ active: boolean }>`
  font-size: 24;
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

  const setUrl = (url: string) => {
    dispatch({
      type: 'TX_FORM_SET_URL',
      url: url.toLowerCase(),
    })
  }

  const send = (
    amount: number,
    url: string,
    outputStrategy: OutputStrategy,
  ) => {
    if (outputStrategy) {
      const { selectionStrategyIsUseAll } = outputStrategy

      if (url) {
        dispatch({
          type: 'TX_SEND_HTTPS_REQUEST',
          amount,
          url,
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
    url,
    amount,
    outputStrategy,
    outputStrategies,
    outputStrategies_error,
    outputStrategies_inProgress,
  } = txForm
  const [transportMethod, setTransportMethod] = useState(
    url ? HTTP_TRANSPORT_METHOD : FILE_TRANSPORT_METHOD,
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

  return (
    <KeyboardAwareScrollView
      keyboardDismissMode={'on-drag'}
      contentContainerStyle={{
        ...Platform.select({
          android: { paddingVertical: 16 },
          ios: { paddingBottom: 64 },
        }),
        paddingHorizontal: 16,
      }}>
      <View style={styles.amountRow}>
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
          placeholder="Amount"
          value={textAmount}
          maxLength={100000}
          units={'ツ'}
        />
        <Text style={styles.alternativeAmount}>
          ≈{' '}
          {hrFiat(
            convertToFiat(amount, currency, currencyRates.rates),
            currency,
          )}
        </Text>
      </View>
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
              <OptioIcon active={transportMethod === FILE_TRANSPORT_METHOD} />
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
              <OptioIcon active={transportMethod === HTTP_TRANSPORT_METHOD} />
              <TransportMethodTitle
                active={transportMethod === HTTP_TRANSPORT_METHOD}>
                HTTP(S)
              </TransportMethodTitle>
            </TransportMethod>
          </View>
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
              </View>
              <Spacer />
            </>
          )}
          <Button
            title={'Send'}
            onPress={() => {
              if (outputStrategy) {
                send(amount, url, outputStrategy)
              }
            }}
            disabled={isTxFormValid(txForm, transportMethod)}
          />
          <Spacer />
        </>
      )) ||
        null}
    </KeyboardAwareScrollView>
  )
}

const SlateCreated = ({ slateId, route, navigation }: SlateCreateProps) => {
  const loadedSlatepack = route?.params?.slatepack
  const dispatch = useDispatch()

  const slatepackShare = () => {
    dispatch({
      type: 'SLATE_SHARE_REQUEST',
      id: slateId,
      isResponse: false,
    })
  }

  const openFile = async () => {
    const { uri } = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    })
    dispatch({
      type: 'SLATE_LOAD_REQUEST',
      slatePath: uri,
    })
  }

  const txFinalize = () => {
    dispatch({
      type: 'TX_FINALIZE_REQUEST',
      slatepack: recipientSlatepack,
    })
  }

  let [slatepack, setSlatepack] = useState<null | string>(null)
  let [recipientSlatepack, setRecipientSlatepack] = useState('')
  let refScrollView = useRef<KeyboardAwareScrollView>()

  const pasteFromClipboard = (s: string) => {
    if (!isValidSlatepack(s)) {
      dispatch({
        type: 'TOAST_SHOW',
        text: 'Wrong slatepack format',
      })

      return
    }
    setRecipientSlatepack(s)
    setTimeout(() => {
      refScrollView.current?.scrollToEnd()
    }, 100)
  }
  // Loading my Slatepack
  useEffect(() => {
    const path = getSlatePath(slateId, false /** not a response **/)
    RNFS.readFile(path, 'utf8').then((slatepack: string) => {
      setSlatepack(slatepack)
    })
  }, [])

  // Loading Recipient's Slatepack
  useEffect(() => {
    if (loadedSlatepack) {
      setRecipientSlatepack(loadedSlatepack)
      navigation.setParams({
        ...route.params,
        slatepack: undefined,
      })
      refScrollView.current?.scrollToEnd()
    }
  }, [loadedSlatepack])

  const finalizeInProgress = useSelector(
    (state) => state.tx.txFinalize.inProgress,
  )

  if (finalizeInProgress) {
    return (
      <View style={styles.slatepackLoading}>
        <ActivityIndicator size="large" color={colors.grey[700]} />
      </View>
    )
  }

  return (
    <KeyboardAwareScrollView
      innerRef={(ref) => {
        refScrollView.current = (ref as unknown) as KeyboardAwareScrollView
        setTimeout(() => {
          refScrollView.current?.scrollToEnd()
        }, 300)
      }}
      contentContainerStyle={{
        ...Platform.select({
          android: { paddingVertical: 16 },
          ios: { paddingBottom: 88 },
        }),
        paddingHorizontal: 16,
      }}
      extraScrollHeight={Platform.select({
        android: 0,
        ios: 176,
      })}
      keyboardDismissMode={'on-drag'}>
      <SafeAreaView edges={['bottom']}>
        <Text style={styles.info}>
          Transactions in Grin are built interactively between a sender and a
          receiver.
        </Text>
        <View style={styles.copyPasteContent}>
          <Text style={styles.copyPasteContentTitle}>Transaction ID</Text>
          <CopyButton content={slateId} subject={'Transaction ID'} />
        </View>
        <Text style={styles.txId}>{slateId}</Text>

        <Text style={styles.info}>
          Text below is your part of the transaction, please share it with the
          recipient, so they can generate their part of the transaction and send
          it back to you.
        </Text>

        <View style={styles.firstStep}>
          {(slatepack && (
            <>
              <View style={styles.copyPasteContent}>
                <Text style={styles.copyPasteContentTitle}>
                  Your part of the transaction
                </Text>
                <CopyButton
                  content={slatepack}
                  subject={'Your part of the transaction'}
                />
              </View>
              <Textarea
                containerStyle={styles.slatepack}
                style={styles.textarea}
                editable={false}
                textAlignVertical={'top'}
                returnKeyType={'done'}>
                {slatepack}
              </Textarea>
              <View style={styles.shareAsFile}>
                <TouchableOpacity onPress={slatepackShare}>
                  <Text style={styles.textButton}>Share as file</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.info}>
                If you have received recipient's part of the transaction, please
                enter it below.
              </Text>
              <View style={styles.copyPasteContent}>
                <Text style={styles.copyPasteContentTitle}>
                  Recipient's part of the transaction
                </Text>
                <PasteButton setFunction={pasteFromClipboard} />
              </View>
              <Textarea
                containerStyle={styles.slatepack}
                onChangeText={setRecipientSlatepack}
                style={styles.textarea}
                placeholder={'BEGINSLATEPACK.\n...\n...\n...\nENDSLATEPACK.'}
                textAlignVertical={'top'}
                returnKeyType={'done'}>
                {recipientSlatepack}
              </Textarea>
              <View style={styles.shareAsFile}>
                <TouchableOpacity onPress={openFile}>
                  <Text style={styles.textButton}>Open file</Text>
                </TouchableOpacity>
              </View>
              <Button
                title="Finish transaction"
                style={styles.button}
                onPress={txFinalize}
              />
            </>
          )) || (
            <View style={styles.slatepackLoading}>
              <ActivityIndicator size="large" color={colors.grey[700]} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  )
}

const TxIncompleteSend = ({ navigation, route }: Props) => {
  const tx = route?.params?.tx
  const title = tx ? `Sending ${hrGrin(Math.abs(tx.amount))}` : `Send`
  const subTitle = tx && `fee: ${hrGrin(tx.fee)}`
  useEffect(() => {
    navigation.setParams({ title, subTitle })
  }, [title, subTitle])

  return (
    <>
      <CardTitle
        style={{}}
        title={title}
        subTitle={subTitle}
        navigation={navigation}
      />
      <View style={styles.container}>
        {tx?.slateId ? (
          <SlateCreated
            slateId={tx.slateId}
            route={route}
            navigation={navigation}
          />
        ) : (
          <SlateNotCreated />
        )}
      </View>
    </>
  )
}

const CopyButton = ({
  subject,
  content,
}: {
  subject: string
  content: string
}) => {
  const dispatch = useDispatch()
  const copyToClipboard = (s: string, subject: string) => {
    return () => {
      Clipboard.setString(s)
      dispatch({
        type: 'TOAST_SHOW',
        text: subject + ' was copied',
      })
    }
  }

  return (
    <TouchableOpacity onPress={copyToClipboard(content, subject)}>
      <Text style={styles.slatepackHeaderCopy}>
        Copy{' '}
        <FontAwesome5Icons
          name="copy"
          size={18}
          style={{
            color: colors.link,
          }}
        />
      </Text>
    </TouchableOpacity>
  )
}

const PasteButton = ({ setFunction }: { setFunction: (s: string) => void }) => {
  const pasteToClipboard = () => {
    Clipboard.getString().then(setFunction)
  }

  return (
    <TouchableOpacity onPress={pasteToClipboard}>
      <Text style={styles.slatepackHeaderCopy}>
        Paste{' '}
        <FontAwesome5Icons
          name="paste"
          size={18}
          style={{
            color: colors.link,
          }}
        />
      </Text>
    </TouchableOpacity>
  )
}

export function androidHeaderTitle(
  params: NavigationProps<'TxIncompleteSend'>['route']['params'],
) {
  if (!params?.subTitle) {
    return params?.title
  }
  return (
    <View>
      <Text style={styles.androidHeaderTitle}>{params?.title}</Text>
      <Text style={styles.androidHeaderSubTitle}>{params?.subTitle}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  androidHeaderTitle: {
    fontSize: 21,
  },
  androidHeaderSubTitle: {
    color: colors.grey[700],
    fontSize: 12,
  },
  container: {
    flexGrow: 1,
  },
  txId: {
    marginTop: 4,
    marginBottom: 24,
    fontFamily: monoSpaceFont,
    textAlign: 'center',
    fontSize: 14,
  },
  slatepack: {
    marginTop: 8,
    flex: 1,
  },
  wrapper: {
    backgroundColor: 'green',
    flexGrow: 0,
  },
  firstStep: {
    // flex: 1,
    // paddingBottom: 64,
  },
  info: {
    color: colors.grey[700],
    marginBottom: 8,
  },
  button: {},
  textarea: {
    maxHeight: 360,
    fontSize: 16,
    fontFamily: monoSpaceFont,
  },
  textButton: {
    color: colors.link,
    fontSize: 18,
  },
  shareAsFile: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  copyPasteContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  copyPasteContentTitle: {
    fontWeight: Platform.select({ android: '700', ios: '500' }),
    fontSize: 16,
  },
  slatepackHeaderCopy: {
    fontWeight: Platform.select({ android: '700', ios: '500' }),
    color: colors.link,
    fontSize: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alternativeAmount: {
    color: colors.grey[700],
    fontSize: 18,
    textAlign: 'right',
    height: 50,
    lineHeight: 50,
    marginLeft: 2,
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
  slatepackLoading: {
    justifyContent: 'center',
    flex: 1,
  },
})

export default TxIncompleteSend
