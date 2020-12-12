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

import React, { useCallback, useEffect, useRef, useState } from 'react'
import DocumentPicker from 'react-native-document-picker'
import RNFS from 'react-native-fs'
import { SafeAreaView } from 'react-native-safe-area-context'

import colors from 'src/common/colors'
import { ActivityIndicator, StyleSheet, View, Platform } from 'react-native'
import { useDispatch } from 'react-redux'
import { useSelector } from 'src/common/redux'
import { Text, Button, monoSpaceFont } from 'src/components/CustomFont'
import { NavigationProps } from 'src/common/types'
import Textarea from 'src/components/Textarea'
import { getSlatePath, isValidSlatepack } from 'src/common'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CopyHeader from 'src/components/CopyHeader'
import ShareRow from 'src/components/ShareRow'
import SectionTitle from 'src/components/SectionTitle'
import InputContentRow from 'src/components/InputContentRow'
import { useFocusEffect } from '@react-navigation/native'

type SlateCreateProps = {
  slateId: string
} & NavigationProps<'TxIncompleteSend'>

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

  const setWithValidation = (s: string) => {
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

  useFocusEffect(
    // useCallback is needed here: https://bit.ly/2G0WKTJ
    useCallback(() => {
      const qrContent = route.params?.qrContent
      if (qrContent) {
        setWithValidation(qrContent)
      }
    }, [route.params]),
  )

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
        <CopyHeader content={slateId} label={'Transaction ID'} />
        <Text style={styles.txId}>{slateId}</Text>

        <Text style={styles.info}>
          Text below is your part of the transaction, please share it with the
          recipient, so they can generate their part of the transaction and send
          it back to you.
        </Text>

        <View>
          {(slatepack && (
            <>
              <SectionTitle title={'Your part of the transaction'} />
              <Textarea
                containerStyle={styles.slatepack}
                style={styles.textarea}
                editable={false}
                textAlignVertical={'top'}
                returnKeyType={'done'}>
                {slatepack}
              </Textarea>
              <ShareRow
                content={slatepack}
                label="Slatepack"
                onShareFile={slatepackShare}
              />
              <Text style={styles.info}>
                If you have received recipient's part of the transaction, please
                enter it below.
              </Text>
              <SectionTitle title="Recipient's part of the transaction" />
              <Textarea
                containerStyle={styles.slatepack}
                onChangeText={setRecipientSlatepack}
                style={styles.textarea}
                placeholder={'BEGINSLATEPACK.\n...\n...\n...\nENDSLATEPACK.'}
                textAlignVertical={'top'}
                returnKeyType={'done'}>
                {recipientSlatepack}
              </Textarea>
              <InputContentRow
                openFileCallback={openFile}
                setFunction={setWithValidation}
                nextScreen={'TxIncompleteSend'}
                label="Slatepack"
              />
              <Button
                title="Finish transaction"
                onPress={txFinalize}
                disabled={!isValidSlatepack(recipientSlatepack)}
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

const styles = StyleSheet.create({
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
  info: {
    color: colors.grey[700],
    marginBottom: 8,
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
  slatepackLoading: {
    justifyContent: 'center',
    flex: 1,
  },
})

export default SlateCreated
