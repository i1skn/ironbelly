import React, { useCallback, useRef } from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import colors from 'src/common/colors'
import { TouchableOpacity, StyleSheet, View } from 'react-native'
import { connect, useDispatch } from 'react-redux'
import Swiper from 'react-native-swiper'
import { hrGrin } from 'src/common'
import { Text, Button, monoSpaceFont } from 'src/components/CustomFont'
import CardTitle from 'src/components/CardTitle'
import { State as ReduxState, Tx } from 'src/common/types'
import { NavigationProps } from 'src/common/types'
import Clipboard from '@react-native-community/clipboard'
import Textarea from 'src/components/Textarea'

interface OwnProps {
  tx: Tx
}

type Props = NavigationProps<'TxIncomplete'> & OwnProps

const TxIncomplete = ({ tx, navigation }: Props) => {
  const dispatch = useDispatch()
  const copyToClipboard = useCallback(
    (s: string) => {
      return () => {
        Clipboard.setString(s)
        dispatch({
          type: 'TOAST_SHOW',
          text: 'Copied to Clipboard',
        })
      }
    },
    [dispatch],
  )
  let swiper = useRef() as React.MutableRefObject<Swiper>
  return (
    <>
      <CardTitle
        title={`Sending ${hrGrin(Math.abs(tx.amount))}`}
        subTitle={`fee: ${hrGrin(tx.fee)}`}
        navigation={navigation}
      />
      <View style={styles.container}>
        <Text style={styles.info}>
          Transactions in Grin are built interactively between a sender and a
          receiver. Text below is your part of the transaction.
        </Text>
        <Text style={styles.info}>
          Please share this text with the recipient, so they can generate their
          part of the transaction and send it back to you.
        </Text>
        <Swiper
          style={styles.wrapper}
          ref={swiper}
          loadMinimal={true}
          removeClippedSubviews={false}
          loop={false}>
          <View style={styles.step}>
            <View style={styles.slatepackHeader}>
              <Text style={styles.slatepackHeaderTitle}>
                Your part of the transaction
              </Text>
              <Text style={styles.slatepackHeaderCopy}>
                Copy{' '}
                <MaterialCommunityIcons
                  name="content-copy"
                  size={18}
                  style={{
                    color: colors.link,
                  }}
                />
              </Text>
            </View>
            <Textarea
              containerStyle={styles.slatepack}
              style={styles.textarea}
              multiline={false}>
              BEGINSLATEPACK. 2yTpUDdp54KCxXo VzeZT1zAQPf6TVU yCjzLzA4GxFqwij
              m2rSKDZAs5MsVvF k2VKxxwaCZXU4E4 YsJfe8MY2HzjuqU Lwd386mbmBha7K8
              HAD4pznznpbsYn5 NAKcBT6zH2KaHom mYanznJwEbTSZBH u263D6hphWeNGnQ
              JVPhXzuWCVfWqAQ U6TpTGqeFiBkQhr 13V9VDV7gQHN6Rq ervFuW1SHNLiZk5
              uGBa9RCZrJ6HhNj 6ERwKp92dDjyy6Y UXP3THeV84JSadB WYKyaXgGZ7ofUMX
              UG5HugfARSwDLXm zPeAANxb9PY9GQn 8K1KdUAwbHqvaie S1PNNkrRvQM94An
              ZxEqh3crGtB2qFz ScDGDjLLioWuHQJ kh7AVsSpnqV4kVy 5EyFS2McqF7W9Ld
              3A8Mp5pmRcnzWF8 XGyJfrJZeQ5wCqa hJyk8Vp3ZSKVD5p osKAcUpzh5mn8Pc
              f3mBHDuXdvVev5Y M31CT9guegKLLTk 5qNuYCYGt1Bufw1 iu2D9YEwW9pwZKG
              ykStmGtiiqSjaBG nzj4XUgUcEag32c aMBjdgjb2eMrPpB fjRBsE4gLXtkCJa
              fVxZjB95k7YDm8i SL5KyxSp2J2d2b8 bu7vSChAKYyHGPG 919x1fiik8W4x7E
              JCTHmKvJs12Ww7A QZ9idD4LUmC6jBF XUQPLQ8E4KajXnZ tg4pCtgudXBqEta
              xyc3uQcZXVMA6cq DianZj4JwM7g7gC HyuEtYVHTP2E7y9 zUQY2qNCTSiHwGT
              KP2kdz. ENDSLATEPACK.
            </Textarea>
            <View style={styles.shareAsFile}>
              <Text style={styles.shareButton}>Share as file</Text>
            </View>
            <Button
              title="Enter Recipient's Part"
              style={styles.button}
              onPress={() => swiper?.current?.scrollBy(1)}
            />
          </View>
          <View style={styles.step}>
            <Button title="Finish" />
          </View>
        </Swiper>
        <Text style={styles.txIdTitle}>Transaction ID</Text>
        <TouchableOpacity onPress={copyToClipboard(tx.slateId)}>
          <Text style={styles.txId}>{tx.slateId}</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

const mapStateToProps = (state: ReduxState, ownProps: Props) => () => {
  return {
    settings: state.settings,
    tx: state.tx.list.data.find((tx) => tx.id === ownProps.route.params.txId),
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  txIdTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  txId: {
    color: colors.grey[700],
    textAlign: 'center',
    marginBottom: 48,
  },
  slatepack: {
    marginTop: 8,
    flex: 1,
  },
  wrapper: {},
  step: {
    flex: 1,
    paddingBottom: 64,
  },
  info: {
    color: colors.grey[700],
    marginBottom: 8,
  },
  button: {
    // marginTop: 16,
  },
  textarea: {
    fontSize: 16,
    fontFamily: monoSpaceFont,
    textAlign: 'center',
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
  slatepackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  slatepackHeaderTitle: {
    fontWeight: '500',
    fontSize: 16,
  },
  slatepackHeaderCopy: {
    fontWeight: '600',
    color: colors.link,
    fontSize: 16,
  },
})

export default connect(mapStateToProps, null)(TxIncomplete)
