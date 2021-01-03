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

import React, { useEffect, useState } from 'react'
import * as LocalAuthentication from 'expo-local-authentication'
import {
  View,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from 'react-native'
import FormTextInput from 'src/components/FormTextInput'
import { BIOMETRY_STATUS } from 'src/modules/settings'
import { isAndroid, getBiometryTitle, getConfigForRust } from 'src/common'
import { KeyboardAvoidingWrapper } from 'src/common'
import { Button } from 'src/components/CustomFont'
import { NavigationProps } from 'src/common/types'
import * as Keychain from 'react-native-keychain'
import colors from 'src/common/colors'
import { passwordScreenMode } from 'src/modules/navigation'
import { useSelector } from 'src/common/redux'
import WalletBridge from 'src/bridges/wallet'
import sleep from 'sleep-promise'
import { useDispatch } from 'react-redux'

type Props = {
  submit: (password: string) => void
  biometryEnabled: boolean
  biometryType: string | undefined | null
} & NavigationProps<'Password'>

function Password({ navigation, route }: Props) {
  const dispatch = useDispatch()
  const [password, setPassword] = useState('')
  const [inProgress, setInProgress] = useState(false)

  const biometryType = useSelector((state) => state.settings.biometryType)
  const biometryEnabled = useSelector(
    (state) => state.settings.biometryStatus === BIOMETRY_STATUS.enabled,
  )
  const configForWalletRust = useSelector(getConfigForRust)

  const handleWrongPassword = async () => {
    await sleep(1000)
    setInProgress(false)
    setPassword('')
    dispatch({
      type: 'TOAST_SHOW',
      text: 'Wrong password',
    })
    await sleep(3000)
    dispatch({
      type: 'TOAST_CLEAR',
    })
  }

  const { mode } = route.params

  useEffect(() => {
    if (biometryEnabled && biometryType !== Keychain.BIOMETRY_TYPE.FACE_ID) {
      setTimeout(() => getPasswordFromBiometry(), 250)
    }
  }, [])

  const submit = async (password: string) => {
    switch (mode) {
      case passwordScreenMode.APP_LOCK: {
        try {
          setInProgress(true)
          await WalletBridge.openWallet(
            JSON.stringify(configForWalletRust),
            password,
          )
          dispatch({
            type: 'SET_WALLET_OPEN',
          })
        } catch (e) {
          handleWrongPassword()
        }
        break
      }
      case passwordScreenMode.PAPER_KEY: {
        try {
          setInProgress(true)
          const mnemonic = await WalletBridge.walletPhrase(
            configForWalletRust.wallet_dir,
            password,
          )
          navigation.replace('ViewPaperKey', {
            mnemonic,
            fromSettings: true,
          })
        } catch (e) {
          handleWrongPassword()
        }
        break
      }
      case passwordScreenMode.ENABLE_BIOMETRY: {
        try {
          setInProgress(true)
          await WalletBridge.walletPhrase(
            configForWalletRust.wallet_dir,
            password,
          )
          if (
            isAndroid ||
            (await Keychain.canImplyAuthentication({
              authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
            }))
          ) {
            await Keychain.setGenericPassword('user', password, {
              accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
              accessible:
                Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
              storage: Keychain.STORAGE_TYPE.AES,
            })
            dispatch({
              type: 'ENABLE_BIOMETRY_SUCCESS',
            })
          }
          navigation.goBack()
        } catch (e) {
          handleWrongPassword()
        }
        break
      }
      case passwordScreenMode.PROTECT_SCREEN: {
        console.log('')
        break
      }
    }
  }

  const getPasswordFromBiometry = async () => {
    const authenticationPrompt = {
      title:
        biometryType === Keychain.BIOMETRY_TYPE.FACE_ID
          ? 'Use Face ID to unlock your wallet'
          : 'Place your finger to unlock your wallet',
    }

    try {
      // Force on Android authentication until we figure how
      // to force it automatically on Keychain.getGenericPassword
      if (isAndroid) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: authenticationPrompt.title,
          disableDeviceFallback: true,
          cancelLabel: 'Enter Password',
        })
        if (!result.success) {
          return
        }
      }
      const creds = await Keychain.getGenericPassword({
        authenticationPrompt,
      })
      if (creds && creds.password) {
        submit(creds.password)
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <>
      <KeyboardAvoidingWrapper
        behavior={isAndroid ? undefined : 'padding'}
        style={styles.container}>
        <TouchableWithoutFeedback
          accessible={false}
          onPress={() => {
            Keyboard.dismiss()
          }}>
          <View style={styles.wrapper}>
            <View style={styles.spanTop} />
            <FormTextInput
              autoFocus={false}
              secureTextEntry={true}
              onChange={setPassword}
              value={password}
              placeholder="Enter password"
            />
            <Button
              style={styles.submit}
              title={`Unlock${
                biometryEnabled && !password
                  ? ' with ' + getBiometryTitle(biometryType)
                  : ''
              }`}
              disabled={inProgress}
              onPress={() => {
                if (biometryEnabled && !password) {
                  getPasswordFromBiometry()
                } else {
                  submit(password)
                }
              }}
              testID="UnlockBtn"
            />
            <View style={styles.spanBottom} />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingWrapper>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wrapper: {
    flex: 1,
  },
  spanTop: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '40%',
  },
  spanBottom: {
    flexGrow: 10,
    flexShrink: 0,
    flexBasis: 16,
  },
  forgot: {
    lineHeight: 27,
    color: colors.onSurface,
  },
  submit: {
    marginTop: 16,
  },
})

// const mapStateToProps = (state: ReduxState) => ({
// biometryEnabled: state.settings.biometryStatus === BIOMETRY_STATUS.enabled,
// biometryType: state.settings.biometryType,
// })

export default Password
