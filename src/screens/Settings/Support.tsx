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

import React, { useState } from 'react'
import { Linking, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Link, Text } from 'src/components/CustomFont'
import { Currency, Dispatch, NavigationProps } from 'src/common/types'
import { RootState } from 'src/common/redux'
import { State as CurrencyRatesState } from 'src/modules/currency-rates'
import {
  slightlyTransparent,
  styleSheetFactory,
  useThemedStyles,
} from 'src/themes'
type DispatchProps = {
  currency: Currency
  requestCurrencyRates: () => void
  setCurrency: (currency: Currency) => void
  currencyRates: CurrencyRatesState
}

type Props = NavigationProps<'SettingsSupport'> & DispatchProps

export default function CurrencyList(props: Props) {
  const [styles] = useThemedStyles(themedStyles)
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Can I cancel transaction?</Text>
      <Text style={styles.text}>
        If the transaction has not been sent to the network yet, you can just
        swipe it left to cancel. Otherwise it's impossible to revert it!
      </Text>
      <Text style={styles.header}>
        While depositing funds to exchange, I've forgotten to specify a memo.
        Can you help?
      </Text>
      <Text style={styles.text}>
        Unfortunately no. Please contact the exchange support, only they could
        help you in this situation. In any case, DO NOT repair or destroy the
        wallet in Settings. In this case you would loose history of the
        transactions and the data, which could help exchange to identify your
        transactions.
      </Text>
      <Text style={styles.header}>Still have questions?</Text>
      <Text style={styles.text}>
        You can visit <Link url={'https://forum.grin.mw/'} title="Grin Forum" />{' '}
        or <Link url={'https://t.me/ironbelly'} title="Ironbelly group" /> in
        Telegram.
      </Text>
    </ScrollView>
  )
}

const themedStyles = styleSheetFactory(theme => ({
  container: {
    flexGrow: 1,
    backgroundColor: theme.background,
    padding: 16,
  },
  header: {
    fontWeight: '600',
    fontSize: 24,
    color: theme.onBackground,
  },
  text: {
    paddingTop: 8,
    paddingBottom: 32,
    fontSize: 17,
    color: theme.onBackground,
    lineHeight: 24,
  },
  smallText: {
    paddingTop: 8,
    paddingBottom: 32,
    fontSize: 14,
    textAlign: 'center',
    color: slightlyTransparent(theme.onSurface),
  },
}))
