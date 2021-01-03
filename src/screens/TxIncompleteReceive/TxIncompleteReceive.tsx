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

import BigNumber from 'bignumber.js'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import RNFS from 'react-native-fs'
import { SafeAreaView } from 'react-native-safe-area-context'
import colors from 'src/common/colors'
import GrinAddress from 'src/screens/TxIncompleteReceive/GrinAddress'
import { ActivityIndicator, StyleSheet, View, Platform } from 'react-native'
import CopyHeader from 'src/components/CopyHeader'
import InputContentRow from 'src/components/InputContentRow'
import { useDispatch } from 'react-redux'
import { Text, Button, monoSpaceFont } from 'src/components/CustomFont'
import CardTitle from 'src/components/CardTitle'
import { Tx } from 'src/common/types'
import { NavigationProps } from 'src/common/types'
import Textarea from 'src/components/Textarea'
import { hrGrin, getSlatePath, isValidSlatepack } from 'src/common'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import SectionTitle from 'src/components/SectionTitle'
import { useFocusEffect } from '@react-navigation/native'
import ShareRow from 'src/components/ShareRow'

interface OwnProps {
  tx: Tx
}

type Props = NavigationProps<'TxIncompleteReceive'> & OwnProps

const TxIncompleteReceive = ({ navigation, route }: Props) => {
  const tx = route?.params?.tx
  const loadedSlatepack = route?.params?.slatepack
  const dispatch = useDispatch()

  const slatepackShare = (tx: Tx) => {
    return () =>
      dispatch({
        type: 'SLATE_SHARE_REQUEST',
        id: tx.slateId,
        isResponse: true,
      })
  }

  const [slatepack, setSlatepack] = useState(loadedSlatepack)
  const [isLoadingSlatepack, setIsLoadingSlatepack] = useState(false)
  const [receiveSlatepack, setReceiveSlatepack] = useState('')
  const refScrollView = useRef<KeyboardAwareScrollView>()
  const title = tx
    ? `Receiving ${hrGrin(new BigNumber(tx.amount).abs())}`
    : `Receive`

  const setWithValidation = (s: string) => {
    if (!isValidSlatepack(s)) {
      dispatch({
        type: 'TOAST_SHOW',
        text: 'Wrong slatepack format',
      })
      return
    }
    setReceiveSlatepack(s)
  }

  useFocusEffect(
    // useCallback is needed here: https://bit.ly/2G0WKTJ
    useCallback(() => {
      const qrContent = route.params?.qrContent
      if (qrContent) {
        setWithValidation(qrContent)
      }
    }, [route.params]),
  )

  useEffect(() => {
    if (loadedSlatepack) {
      setReceiveSlatepack(loadedSlatepack)
      navigation.setParams({
        slatepack: undefined,
      })
    }
  }, [loadedSlatepack])

  useEffect(() => {
    if (tx?.slateId) {
      setIsLoadingSlatepack(true)
      const path = getSlatePath(tx.slateId, true /** response **/)
      RNFS.readFile(path, 'utf8')
        .then((slatepack: string) => {
          setSlatepack(slatepack)
        })
        .catch(() => {
          // Recived via Grin address
        })
        .finally(() => {
          setIsLoadingSlatepack(false)
        })
      refScrollView.current?.scrollToEnd()
    }
    navigation.setParams({ title })
  }, [tx, title])

  const generateResponse = () => {
    dispatch({
      type: 'TX_RECEIVE_REQUEST',
      slatepack: receiveSlatepack,
    })
  }

  const openFile = (uri: string) => {
    dispatch({
      type: 'SLATE_LOAD_REQUEST',
      slatePath: uri,
    })
  }

  return (
    <>
      <CardTitle title={title} navigation={navigation} />
      <View style={styles.container}>
        <KeyboardAwareScrollView
          innerRef={(ref) => {
            refScrollView.current = (ref as unknown) as KeyboardAwareScrollView
          }}
          contentContainerStyle={{
            ...Platform.select({
              android: { paddingVertical: 16 },
              ios: { paddingBottom: 64 },
            }),
            paddingHorizontal: 16,
          }}
          extraScrollHeight={Platform.select({
            android: 0,
            ios: 176,
          })}
          keyboardDismissMode={'on-drag'}>
          <SafeAreaView edges={['bottom']}>
            <>
              {(tx?.slateId && (
                <>
                  <CopyHeader content={tx.slateId} label={'Transaction ID'} />
                  <Text style={styles.txId}>{tx.slateId}</Text>
                  {(isLoadingSlatepack && (
                    <View style={styles.slatepackLoading}>
                      <ActivityIndicator
                        size="large"
                        color={colors.grey[700]}
                      />
                    </View>
                  )) ||
                    (slatepack && (
                      <>
                        <Text style={styles.info}>
                          Please send your part of the transaction to the sender
                        </Text>
                        <SectionTitle title={'Your part of the transaction'} />
                        <Textarea
                          textAlignVertical={'top'}
                          containerStyle={styles.slatepack}
                          style={styles.textarea}
                          editable={false}
                          returnKeyType={'done'}>
                          {slatepack}
                        </Textarea>
                        <ShareRow
                          content={slatepack}
                          label="Slatepack"
                          onShareFile={slatepackShare(tx)}
                        />
                      </>
                    )) ||
                    null}
                </>
              )) || (
                <>
                  <GrinAddress />
                  <Text style={styles.infoMarginTop}>
                    If for some reason Grin Address does not work for you, you
                    can also receive manually.
                  </Text>
                  <Text style={styles.info}>
                    Please enter sender's part of the transaction below, so you
                    can you generate your part of the transaction and send it
                    back to the sender
                  </Text>
                  <SectionTitle title="Sender's part of the transaction" />
                  <Textarea
                    containerStyle={styles.slatepack}
                    onChangeText={setReceiveSlatepack}
                    style={styles.textarea}
                    placeholder={
                      'BEGINSLATEPACK.\n...\n...\n...\nENDSLATEPACK.'
                    }
                    textAlignVertical={'top'}
                    returnKeyType={'done'}>
                    {receiveSlatepack}
                  </Textarea>
                  <InputContentRow
                    openFileCallback={openFile}
                    setFunction={setWithValidation}
                    nextScreen={'TxIncompleteReceive'}
                    label="Grin Address"
                  />
                  <Button
                    title="Generate response"
                    disabled={!isValidSlatepack(receiveSlatepack)}
                    onPress={generateResponse}
                  />
                </>
              )}
            </>
          </SafeAreaView>
        </KeyboardAwareScrollView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
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
  infoMarginTop: {
    color: colors.grey[700],
    marginTop: 16,
    marginBottom: 8,
    fontSize: 17,
  },
  info: {
    color: colors.grey[700],
    marginBottom: 8,
    fontSize: 17,
  },
  grinAddressButton: {
    marginTop: 12,
    marginBottom: 16,
  },
  textarea: {
    maxHeight: 360,
    fontSize: 16,
    fontFamily: monoSpaceFont,
  },
  textButton: {
    color: colors.link,
    fontSize: 18,
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

export default TxIncompleteReceive
