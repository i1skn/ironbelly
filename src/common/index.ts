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
import moment from 'moment'
import 'intl'
import 'intl/locale-data/jsonp/en'
import RNFS from 'react-native-fs'
import { Platform, KeyboardAvoidingView } from 'react-native'
import {
  RustTx,
  Tx,
  RustOutputStrategy,
  RustPmmrRange,
  OutputStrategy,
  PmmrRange,
  RustBalance,
  Balance,
  UrlQuery,
  Currency,
  Slate,
} from 'src/common/types'
import colors from 'src/common/colors'
import styled from 'styled-components/native'
import { Text } from 'src/components/CustomFont'
import { isIphoneX } from 'react-native-iphone-x-helper'
import { BIOMETRY_TYPE } from 'react-native-keychain'
import { decode as atob } from 'base-64'
import { RootState } from './redux'
export const isAndroid = Platform.OS === 'android'

console.log(isAndroid ? RNFS.DocumentDirectoryPath : RNFS.LibraryDirectoryPath)

export const hrGrin = (
  amount: BigNumber.Value,
  minimumFractionDigits = 9,
): string => {
  return (
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits,
    })
      // TODO: avoid converstion `toNumber` here
      .format(new BigNumber(amount).dividedBy(1000000000).toNumber())
      .replace(/\$/, '') + 'ツ'
  )
}
export const hrFiat = (amount: BigNumber.Value, currency: Currency): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.fractionDigits,
    // TODO: avoid converstion `toNumber` here
  }).format(new BigNumber(amount).toNumber())
}
export const convertToFiat = (
  amount: BigNumber.Value,
  currency: Currency,
  rates: Record<string, number>,
): string => {
  const multiplier = rates[currency.code.toLowerCase()]
  return new BigNumber(amount)
    .dividedBy(1000000000)
    .multipliedBy(multiplier || 0)
    .toFixed()
}
export const mapRustTx = (rTx: RustTx): Tx => {
  const fee = new BigNumber(rTx.fee ?? 0).toFixed()
  const amount = new BigNumber(rTx.amount_credited)
    .minus(rTx.amount_debited)
    .plus(fee)
    .toFixed()
  return {
    id: rTx.id,
    slateId: rTx.tx_slate_id,
    storedTx: rTx.stored_tx,
    type: rTx.tx_type,
    confirmed: rTx.confirmed,
    creationTime: rTx.creation_ts,
    kernelExcess: rTx.kernel_excess,
    amount,
    fee,
  }
}
export const mapRustBalance = (rB: RustBalance): Balance => {
  return {
    amountAwaitingConfirmation: rB.amount_awaiting_confirmation,
    amountCurrentlySpendable: rB.amount_currently_spendable,
    amountImmature: rB.amount_immature,
    amountLocked: rB.amount_locked,
    lastConfirmedHeight: rB.last_confirmed_height,
    minimumConfirmations: rB.minimum_confirmations,
    total: rB.total,
  }
}
export const mapRustOutputStrategy = (
  oS: RustOutputStrategy,
): OutputStrategy => {
  return {
    total: oS.total,
    fee: oS.fee,
    selectionStrategyIsUseAll: oS.selection_strategy_is_use_all,
  }
}
export const mapPmmrRange = (pR: RustPmmrRange): PmmrRange => {
  return {
    lastRetrievedIndex: pR[0],
    highestIndex: pR[1],
  }
}
export const getConfigForRust = (state: RootState) => {
  return {
    wallet_dir: APPLICATION_SUPPORT_DIRECTORY,
    check_node_api_http_addr: state.settings.checkNodeApiHttpAddr,
    chain: state.settings.chain,
    account: 'default',
    minimum_confirmations: state.settings.minimumConfirmations,
  }
}

export const SLATES_DIRECTORY = RNFS.DocumentDirectoryPath + '/slates'
export const APPLICATION_SUPPORT_DIRECTORY = isAndroid
  ? RNFS.DocumentDirectoryPath
  : RNFS.LibraryDirectoryPath + '/Application Support'
export const WALLET_DATA_DIRECTORY =
  APPLICATION_SUPPORT_DIRECTORY + '/wallet_data'
export const TOR_DIRECTORY = APPLICATION_SUPPORT_DIRECTORY + '/tor'
export const checkSlatesDirectory = () => {
  RNFS.exists(SLATES_DIRECTORY).then(exists => {
    if (!exists) {
      RNFS.mkdir(SLATES_DIRECTORY, {
        NSURLIsExcludedFromBackupKey: true,
      }).then(() => {
        console.log(`${SLATES_DIRECTORY} was created`)
      })
    }
  })
}
export const ADDRESS_TRANSPORT_METHOD = 'address'
export const FILE_TRANSPORT_METHOD = 'file'
export const checkApplicationSupportDirectory = () => {
  RNFS.exists(APPLICATION_SUPPORT_DIRECTORY).then(exists => {
    if (!exists) {
      RNFS.mkdir(APPLICATION_SUPPORT_DIRECTORY, {
        NSURLIsExcludedFromBackupKey: true,
      }).then(() => {
        console.log(`${APPLICATION_SUPPORT_DIRECTORY} was created`)
      })
    }
  })
}
export const checkWalletDataDirectory = async () => {
  const exists = await RNFS.exists(WALLET_DATA_DIRECTORY)
  if (!exists) {
    await RNFS.mkdir(WALLET_DATA_DIRECTORY, {
      NSURLIsExcludedFromBackupKey: true,
    })
    console.log(`${WALLET_DATA_DIRECTORY} was created`)
  }
}

export const Spacer = styled.View<{height?: string}>`
  height: ${({ height }) => (height ?? isIphoneX() ? '24px' : '16px')};
  width: 100%;
`
export const isResponseSlate = async (slate: Slate) => {
  try {
    return slate.sta === 'S2'
  } catch (e) {
    throw new Error('Cannot parse slate file')
  }
}
export const getSlatePath = (slateId: string, isResponse: boolean) => {
  return `${SLATES_DIRECTORY}/${slateId}.${isResponse ? 'S2' : 'S1'}.slatepack`
}
export const TextareaTitle = styled.Text`
  font-size: 20;
  font-weight: 500;
  margin-bottom: 12;
  margin-top: 24;
`
export const Textarea = styled.Text`
  margin-left: -20;
  padding: 20px;
  margin-right: -20;
  background-color: #fbfbfb;
  font-size: 18;
  font-weight: 300;
`
export const Title = styled(Text)`
  font-size: 24;
  font-weight: 500;
  margin-bottom: 5;
`
export const SubTitle = styled(Text)`
  font-size: 16;
  font-weight: 500;
  margin-bottom: 30;
  color: ${() => colors.grey};
`
export const FlexGrow = styled.View`
  flex-grow: 1;
`
export const Wrapper = styled.View`
  padding: 0 16px;
  flex: 1;
`
export const KeyboardAvoidingWrapper = styled(KeyboardAvoidingView)`
  padding: 0 16px 0 16px;
  flex: 1;
`
export const LoaderView = styled.View`
  flex-grow: 1;
  justify-content: center;
  align-items: center;
`
export const UnderHeaderBlock = styled.View`
  margin-top: 16px;
  margin-bottom: 16px;
`

export const UnderHeaderBlockText = styled.Text`
  color: ${() => colors.onBackgroundLight};
  font-size: 16;
  line-height: 24;
`

export const getBiometryTitle = (biometryType?: string | null) => {
  switch (biometryType) {
    case BIOMETRY_TYPE.TOUCH_ID:
      return 'Touch ID'

    case BIOMETRY_TYPE.FACE_ID:
      return 'Face ID'

    case BIOMETRY_TYPE.FINGERPRINT:
      return 'Fingerprint'

    default:
      return ''
  }
}
export const parseSendLink = (query: UrlQuery) => {
  const amount = parseFloat(query.amount)
  const destination = query.destination.trim()
  const message = atob(query.message).trim()
  return {
    amount,
    destination,
    message,
  }
}

export const isValidSlatepack = (s: string) => {
  return /^BEGINSLATEPACK\..*ENDSLATEPACK\.$/gm.test(s)
}

export const formatDate = (date: moment.Moment) => date.format('DD MMMM YYYY')
export const formatTime = (time: moment.Moment) =>
  time.format('dddd, DD MMMM YYYY, HH:mm')

export const currencyList = [
  {
    code: 'btc',
    fractionDigits: 3,
  },
  {
    code: 'eth',
    fractionDigits: 3,
  },
  {
    code: 'ltc',
    fractionDigits: 3,
  },
  {
    code: 'bch',
    fractionDigits: 3,
  },
  {
    code: 'bnb',
    fractionDigits: 3,
  },
  {
    code: 'eos',
    fractionDigits: 3,
  },
  {
    code: 'xrp',
    fractionDigits: 3,
  },
  {
    code: 'xlm',
    fractionDigits: 3,
  },
  {
    code: 'usd',
    fractionDigits: 2,
  },
  {
    code: 'aed',
    fractionDigits: 2,
  },
  {
    code: 'ars',
    fractionDigits: 2,
  },
  {
    code: 'aud',
    fractionDigits: 2,
  },
  {
    code: 'bdt',
    fractionDigits: 2,
  },
  {
    code: 'bhd',
    fractionDigits: 2,
  },
  {
    code: 'bmd',
    fractionDigits: 2,
  },
  {
    code: 'brl',
    fractionDigits: 2,
  },
  {
    code: 'cad',
    fractionDigits: 2,
  },
  {
    code: 'chf',
    fractionDigits: 2,
  },
  {
    code: 'clp',
    fractionDigits: 2,
  },
  {
    code: 'cny',
    fractionDigits: 2,
  },
  {
    code: 'czk',
    fractionDigits: 2,
  },
  {
    code: 'dkk',
    fractionDigits: 2,
  },
  {
    code: 'eur',
    fractionDigits: 2,
  },
  {
    code: 'gbp',
    fractionDigits: 2,
  },
  {
    code: 'hkd',
    fractionDigits: 2,
  },
  {
    code: 'huf',
    fractionDigits: 2,
  },
  {
    code: 'idr',
    fractionDigits: 2,
  },
  {
    code: 'ils',
    fractionDigits: 2,
  },
  {
    code: 'inr',
    fractionDigits: 2,
  },
  {
    code: 'jpy',
    fractionDigits: 2,
  },
  {
    code: 'krw',
    fractionDigits: 2,
  },
  {
    code: 'kwd',
    fractionDigits: 2,
  },
  {
    code: 'lkr',
    fractionDigits: 2,
  },
  {
    code: 'mmk',
    fractionDigits: 2,
  },
  {
    code: 'mxn',
    fractionDigits: 2,
  },
  {
    code: 'myr',
    fractionDigits: 2,
  },
  {
    code: 'nok',
    fractionDigits: 2,
  },
  {
    code: 'nzd',
    fractionDigits: 2,
  },
  {
    code: 'php',
    fractionDigits: 2,
  },
  {
    code: 'pkr',
    fractionDigits: 2,
  },
  {
    code: 'pln',
    fractionDigits: 2,
  },
  {
    code: 'rub',
    fractionDigits: 2,
  },
  {
    code: 'sar',
    fractionDigits: 2,
  },
  {
    code: 'sek',
    fractionDigits: 2,
  },
  {
    code: 'sgd',
    fractionDigits: 2,
  },
  {
    code: 'thb',
    fractionDigits: 2,
  },
  {
    code: 'try',
    fractionDigits: 2,
  },
  {
    code: 'twd',
    fractionDigits: 2,
  },
  {
    code: 'uah',
    fractionDigits: 2,
  },
  {
    code: 'vef',
    fractionDigits: 2,
  },
  {
    code: 'vnd',
    fractionDigits: 2,
  },
  {
    code: 'zar',
    fractionDigits: 2,
  },
  {
    code: 'xdr',
    fractionDigits: 2,
  },
  {
    code: 'xag',
    fractionDigits: 2,
  },
  {
    code: 'xau',
    fractionDigits: 2,
  },
]
