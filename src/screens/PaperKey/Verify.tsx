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

import React, { useCallback, useMemo, useState } from 'react'
import { useHeaderHeight } from '@react-navigation/elements'
import { Alert, ScrollView, View } from 'react-native'
import { connect } from 'react-redux'
import NetInfo from '@react-native-community/netinfo'
import Textarea from 'src/components/Textarea'

import {
  UnderHeaderBlock,
  KeyboardAvoidingWrapper,
  UnderHeaderBlockText,
} from 'src/common'
import { Text, Button, monoSpaceFont } from 'src/components/CustomFont'
import { RootState } from 'src/common/redux'
import { NavigationProps, Dispatch } from 'src/common/types'
import { WalletScanState } from 'src/modules/wallet'
import { styleSheetFactory, useThemedStyles } from 'src/themes'
import { SafeAreaView } from 'react-native-safe-area-context'
import bip39words from 'src/common/bip39words'
import PasteButton from 'src/components/PasteButton'
import CheckBox from 'react-native-check-box'

type Props = NavigationProps<'VerifyPaperKey'> &
  WalletScanState & {
    isNew: boolean;
    createWallet: (password: string, mnemonic: string, isNew: boolean) => void;
  };

function Verify(props: Props) {
  const { isNew, route, createWallet } = props
  const [paperKey, setPaperKey] = useState('')
  const [styles, theme] = useThemedStyles(themedStyles)

  const onContinuePress = useCallback(() => {
    if (!isNew) {
      NetInfo.fetch().then(({ type }) => {
        if (type === 'none') {
          Alert.alert(
            'Device is offline',
            'Wallet recovery requires connection to the internet!',
            [
              {
                text: 'Ok',
              },
            ],
          )
        } else if (type !== 'wifi') {
          Alert.alert(
            'Warning',
            'Wallet recovery requires to download A LOT OF DATA. Consider, that depend on your internet provider additional costs may occur!',
            [
              {
                text: 'Cancel',
              },
              {
                text: 'Continue',
                style: 'destructive',
                onPress: () => {
                  createWallet(route.params.password, paperKey, isNew)
                },
              },
            ],
          )
        } else {
          createWallet(route.params.password, paperKey, isNew)
        }
      })
    } else {
      createWallet(route.params.password, paperKey, isNew)
    }
  }, [createWallet, isNew, paperKey, route.params.password])

  const headerHeight = useHeaderHeight()

  const mnemonicWords = useMemo(
    () => (props.route.params.mnemonic || '').split(' '),
    [props.route.params?.mnemonic],
  )

  const separatedWords = useMemo(() => {
    return paperKey.trim().split(' ')
  }, [paperKey])

  const invalidWordsCount = [12, 24].indexOf(separatedWords.length) === -1

  const wordsToCheck = useMemo(() => paperKey.split(' '), [paperKey])

  const errorMessage = useMemo(() => {
    const invalidWords = wordsToCheck
      .slice(0, wordsToCheck.length - 1)
      .filter(word => bip39words.indexOf(word) === -1)
    if (invalidWords.length) {
      return (
        invalidWords.join(', ') +
        ': invalid word' +
        (invalidWords.length === 1 ? '' : 's')
      )
    }
    if (
      isNew &&
      mnemonicWords.length === paperKey.split(' ').length &&
      !route.params?.mnemonic?.startsWith(paperKey)
    ) {
      return 'incorrect words, please double check paper key at the previous step'
    }
    return ''
  }, [
    isNew,
    mnemonicWords.length,
    paperKey,
    route.params?.mnemonic,
    wordsToCheck,
  ])

  const lastWordInvalid = useMemo(() => {
    return bip39words.indexOf(wordsToCheck[wordsToCheck.length - 1]) === -1
  }, [wordsToCheck])

  const [checked, setChecked] = useState(false)

  const disabled =
    !!errorMessage ||
    invalidWordsCount ||
    (isNew ? !checked || route.params.mnemonic !== paperKey : lastWordInvalid)

  return (
    <SafeAreaView edges={['bottom']} style={styles.wrapper}>
      <KeyboardAvoidingWrapper
        behavior={'padding'}
        keyboardVerticalOffset={headerHeight + 16}>
        <ScrollView style={styles.scrollView}>
          <UnderHeaderBlock>
            <UnderHeaderBlockText>
              {isNew
                ? 'Enter the paper key you have just backed up to verify its correctness.'
                : 'Enter the paper key to continue.'}
            </UnderHeaderBlockText>
          </UnderHeaderBlock>
          <Textarea
            containerStyle={styles.words}
            style={styles.input}
            value={paperKey}
            onChangeText={setPaperKey}
            placeholder={'space separated words'}
            autoFocus={true}
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            autoCapitalize={'none'}
          />
          <View style={styles.pasteButton}>
            <PasteButton setFunction={setPaperKey} />
          </View>
          <Text style={styles.error}>{errorMessage}</Text>
        </ScrollView>
        {isNew && (
          <CheckBox
            style={styles.checkbox}
            checkBoxColor={theme.secondary}
            onClick={() => {
              setChecked(!checked)
            }}
            isChecked={checked}
            rightTextView={
              <View style={styles.warningText}>
                <Text style={styles.checkboxText}>
                  I understand that this Paper Key is THE ONLY way to restore my
                  wallet if this device is lost or I forget my password!
                </Text>
              </View>
            }
          />
        )}
        <Button
          testID="VerifyPaperKeyContinueButton"
          title="Continue"
          disabled={disabled}
          onPress={onContinuePress}
        />
      </KeyboardAvoidingWrapper>
    </SafeAreaView>
  )
}

const themedStyles = styleSheetFactory(theme => ({
  wrapper: {
    flex: 1,
  },
  words: {
    minHeight: 160,
    justifyContent: 'center',
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 8,
  },
  scrollView: {},
  input: {
    backgroundColor: theme.surface,
    color: theme.onSurface,
    fontSize: 18,
    fontWeight: '400',
    flex: 0,
    fontFamily: monoSpaceFont,
    textAlign: 'center',
  },
  error: {
    color: theme.warning,
    marginTop: 16,
  },
  pasteButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  checkbox: {
    marginVertical: 16,
  },
  warningText: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    flex: 1,
    paddingLeft: 16,
  },
  checkboxText: {
    color: theme.onBackground,
  },
}))

const mapStateToProps = (state: RootState) => ({
  ...state.wallet.walletScan,
  isNew: state.wallet.walletInit.isNew,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  createWallet: (password: string, phrase: string, isNew: boolean) => {
    dispatch({
      type: 'WALLET_INIT_REQUEST',
      password,
      phrase,
      isNew,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(Verify)
