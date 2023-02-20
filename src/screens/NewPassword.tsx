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

import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import FormTextInput from 'src/components/FormTextInput'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { RootState } from 'src/common/redux'
import { Error, NavigationProps, Dispatch } from 'src/common/types'

import {
  Wrapper,
  UnderHeaderBlock,
  Spacer,
  FlexGrow,
  UnderHeaderBlockText,
} from 'src/common'
import { Button, Text } from 'src/components/CustomFont'
import WalletBridge from 'src/bridges/wallet'

type Props = NavigationProps<'NewPassword'> & {
  error: Error | undefined | null;
  newWallet: boolean;
  setIsNew: (value: boolean) => void;
};

function NewPassword({ route, setIsNew, navigation, newWallet }: Props) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  useEffect(() => {
    setIsNew(route.params?.isNew ?? false)
  }, [])

  const scrollView = useRef<KeyboardAwareScrollView>()

  return (
    <FlexGrow>
      <KeyboardAwareScrollView
        style={{
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={0}
        innerRef={sv => {
          scrollView.current = sv as unknown as KeyboardAwareScrollView
        }}>
        <Wrapper>
          <UnderHeaderBlock>
            <UnderHeaderBlockText>
              Choose a strong password to protect your new wallet.
            </UnderHeaderBlockText>
          </UnderHeaderBlock>
          <FormTextInput
            testID="Password"
            returnKeyType={'next'}
            autoFocus={true}
            secureTextEntry={true}
            onChange={setPassword}
            value={password}
            title="Password"
          />
          <Spacer />
          <FormTextInput
            testID="ConfirmPassword"
            returnKeyType={'done'}
            autoFocus={false}
            secureTextEntry={true}
            onChange={setConfirmPassword}
            onFocus={() => {
              setTimeout(() => {
                scrollView.current?.scrollToEnd()
              }, 100)
            }}
            value={confirmPassword}
            title="Confirm password"
          />
          <FlexGrow />
          <Spacer />
          <Button
            testID="SubmitPassword"
            title={'Continue'}
            onPress={async () => {
              if (newWallet) {
                const mnemonic = await WalletBridge.seedNew(32)
                navigation.navigate('ViewPaperKey', {
                  fromSettings: false,
                  mnemonic,
                  password,
                })
              } else {
                navigation.navigate('VerifyPaperKey', {
                  title: 'Paper key',
                  password,
                })
              }
            }}
            disabled={!(password && password === confirmPassword)}
          />
          <Spacer />
        </Wrapper>
      </KeyboardAwareScrollView>
    </FlexGrow>
  )
}

const mapStateToProps = (state: RootState) => ({
  error: state.wallet.walletInit.error,
  newWallet: state.wallet.walletInit.isNew,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setIsNew: (value: boolean) => {
    dispatch({
      type: 'WALLET_INIT_SET_IS_NEW',
      value,
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(NewPassword)
