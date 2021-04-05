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

import React, { Fragment, useEffect } from 'react'
import { ActivityIndicator } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components/native'
import { Spacer, LoaderView } from 'src/common'
import { RootState } from 'src/common/redux'
import { Text } from 'src/components/CustomFont'
import { WalletScanState } from 'src/modules/wallet'
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import KeepAwake from 'react-native-keep-awake'
import { Dispatch } from 'src/common/types'
import { styleSheetFactory, useThemedStyles } from 'src/themes'

type Props = WalletScanState & {
  startScan: () => void
  resetScan: () => void
}
function WalletScan(props: Props) {
  const [styles, theme] = useThemedStyles(themedStyles)
  const { startScan, inProgress, progress, error } = props
  const onFinish = () => {
    props.resetScan()
  }

  useEffect(() => {
    if (inProgress) {
      startScan()
    }
  }, [])

  useEffect(() => {
    if (error.message) {
      onFinish()
    }
  }, [error])

  return (
    <Wrapper>
      <KeepAwake />
      <Fragment>
        {(inProgress && (
          <Fragment>
            <AnimatedCircularProgress
              style={{
                alignSelf: 'center',
              }}
              size={120}
              backgroundWidth={4}
              width={6}
              fill={progress}
              tintColor={theme.primary}
              rotation={0}
              duration={100}
              backgroundColor={theme.background}>
              {() => <Text style={styles.progressText}>{`${progress}%`}</Text>}
            </AnimatedCircularProgress>
            <Spacer />
            <Text style={styles.statusText}>Syncing...</Text>
          </Fragment>
        )) || <ActivityIndicator size="large" color={theme.primary} />}
      </Fragment>
    </Wrapper>
  )
}

const Wrapper = styled(LoaderView)``

const themedStyles = styleSheetFactory((theme) => ({
  wrapper: {
    padding: 16,
  },
  progressText: {
    fontSize: 28,
    color: theme.onBackground,
  },
  statusText: {
    fontSize: 24,
    color: theme.onBackground,
    textAlign: 'center',
  },
}))

const mapStateToProps = (state: RootState) => ({ ...state.wallet.walletScan })

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startScan: () => {
    dispatch({
      type: 'WALLET_SCAN_PMMR_RANGE_REQUEST',
    })
  },
  resetScan: () => {
    dispatch({
      type: 'WALLET_SCAN_RESET',
    })
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(WalletScan)
