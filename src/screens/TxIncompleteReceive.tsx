import React, { useEffect, useState } from 'react'
import RNFS from 'react-native-fs'
import { SafeAreaView } from 'react-native-safe-area-context'
import DocumentPicker from 'react-native-document-picker'
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
import { Text, Button, monoSpaceFont } from 'src/components/CustomFont'
import CardTitle from 'src/components/CardTitle'
import { Tx } from 'src/common/types'
import { NavigationProps } from 'src/common/types'
import Clipboard from '@react-native-community/clipboard'
import Textarea from 'src/components/Textarea'
import { hrGrin, getSlatePath } from 'src/common'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

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

  let [slatepack, setSlatepack] = useState(loadedSlatepack)
  let [receiveSlatepack, setReceiveSlatepack] = useState('')
  const title = tx ? `Receiving ${hrGrin(Math.abs(tx.amount))}` : `Receive`

  useEffect(() => {
    if (loadedSlatepack) {
      setReceiveSlatepack(loadedSlatepack)
      navigation.setParams({
        slatepack: undefined,
      })
    }
  }, [loadedSlatepack])

  useEffect(() => {
    if (tx) {
      const path = getSlatePath(tx.slateId, true /** response **/)
      RNFS.readFile(path, 'utf8').then((slatepack: string) => {
        setSlatepack(slatepack)
      })
    }
    navigation.setParams({ title })
  }, [tx, title])

  const generateResponse = () => {
    dispatch({
      type: 'TX_RECEIVE_REQUEST',
      slatepack: receiveSlatepack,
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

  return (
    <>
      <CardTitle title={title} navigation={navigation} />
      <View style={styles.container}>
        <KeyboardAwareScrollView
          contentContainerStyle={{ paddingBottom: 64 }}
          extraScrollHeight={Platform.select({
            android: 0,
            ios: 176,
          })}
          keyboardDismissMode={'on-drag'}>
          <SafeAreaView edges={['bottom']}>
            <Text style={styles.info}>
              Transactions in Grin are built interactively between a sender and
              a receiver.
            </Text>
            {(tx && (
              <>
                <Text style={styles.info}>
                  Please send your part of the transaction to the sender
                </Text>
                <View style={styles.copyPasteContent}>
                  <Text style={styles.copyPasteContentTitle}>
                    Transaction ID
                  </Text>
                  <CopyButton content={tx.slateId} subject={'Transaction ID'} />
                </View>
                <Text style={styles.txId}>{tx.slateId}</Text>
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
                      returnKeyType={'done'}>
                      {slatepack}
                    </Textarea>
                    <View style={styles.shareAsFile}>
                      <TouchableOpacity onPress={slatepackShare(tx)}>
                        <Text style={styles.shareButton}>Share as file</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )) || (
                  <View style={styles.slatepackLoading}>
                    <ActivityIndicator size="large" color={colors.grey[700]} />
                  </View>
                )}
              </>
            )) || (
              <>
                <Text style={styles.info}>
                  Please enter sender's part of the transaction below, so you
                  can you generate your part of the transaction and send it back
                  to the sender
                </Text>
                <View style={styles.copyPasteContent}>
                  <Text style={styles.copyPasteContentTitle}>
                    Sender's part of the transaction
                  </Text>
                  <PasteButton setFunction={setReceiveSlatepack} />
                </View>
                <Textarea
                  containerStyle={styles.slatepack}
                  onChangeText={setReceiveSlatepack}
                  style={styles.textarea}
                  placeholder="BEGINSLATEPACK. ... ENDSLATEPACK."
                  returnKeyType={'done'}>
                  {receiveSlatepack}
                </Textarea>
                <View style={styles.shareAsFile}>
                  <TouchableOpacity onPress={openFile}>
                    <Text style={styles.shareButton}>Open file</Text>
                  </TouchableOpacity>
                </View>
                <Button
                  title="Generate response"
                  style={styles.button}
                  onPress={generateResponse}
                />
              </>
            )}
          </SafeAreaView>
        </KeyboardAwareScrollView>
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
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
    fontSize: 16,
    fontFamily: monoSpaceFont,
  },
  shareButton: {
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
    fontWeight: '500',
    fontSize: 16,
  },
  slatepackHeaderCopy: {
    fontWeight: '600',
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

export default TxIncompleteReceive
