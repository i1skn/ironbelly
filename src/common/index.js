// @flow
//
// Copyright 2019 Ivan Sorokin.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import moment from 'moment'
import RNFS from 'react-native-fs'
import { KeyboardAvoidingView } from 'react-native'
import {
  type RustTx,
  type Tx,
  type RustOutputStrategy,
  type OutputStrategy,
  type RustBalance,
  type Balance,
} from 'common/types'
import styled from 'styled-components/native'
import { Text } from 'components/CustomFont'

export const hrGrin = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 3,
  })
    .format(amount / 1000000000)
    .replace(/\$/, 'ツ')
}

export const hrFiat = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

const CURRENCY_RATES = {
  EUR: 0.0,
  USD: 0.0,
}

export const convertToFiat = (amount: number, currency: string): number => {
  return amount * CURRENCY_RATES[currency]
}

export const mapRustTx = (rTx: RustTx): Tx => {
  return {
    id: rTx.id,
    slateId: rTx.tx_slate_id,
    storedTx: rTx.stored_tx,
    type: rTx.tx_type,
    confirmed: rTx.confirmed,
    creationTime: moment(rTx.creation_ts),
    amount: rTx.amount_credited - rTx.amount_debited + rTx.fee,
    fee: rTx.fee,
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

export const mapRustOutputStrategy = (oS: RustOutputStrategy): OutputStrategy => {
  return {
    total: oS.total,
    fee: oS.fee,
    selectionStrategyIsUseAll: oS.selection_strategy_is_use_all,
  }
}

export const SLATES_DIRECTORY = RNFS.DocumentDirectoryPath + `/slates`
export const APPLICATION_SUPPORT_DIRECTORY = RNFS.LibraryDirectoryPath + '/Application Support'
export const WALLET_DATA_DIRECTORY = APPLICATION_SUPPORT_DIRECTORY + '/wallet_data'

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

export const checkWalletDataDirectory = () => {
  return RNFS.exists(WALLET_DATA_DIRECTORY).then(exists => {
    if (!exists) {
      return RNFS.mkdir(WALLET_DATA_DIRECTORY, {
        NSURLIsExcludedFromBackupKey: true,
      }).then(() => {
        console.log(`${WALLET_DATA_DIRECTORY} was created`)
      })
    }
    return
  })
}

export const checkApiSecret = () => {
  const apiSecretFilePath = APPLICATION_SUPPORT_DIRECTORY + '/.api_secret'
  RNFS.exists(apiSecretFilePath).then(exists => {
    if (!exists) {
      RNFS.writeFile(apiSecretFilePath, 'ac9rOHFKASTRzZ4SNJun').then(() => {
        console.log(`${apiSecretFilePath} was created`)
      })
    }
  })
}

export const isWalletInitialized = () => {
  const seedFilePath = WALLET_DATA_DIRECTORY + '/wallet.seed'
  return RNFS.exists(seedFilePath)
}

export const Spacer = styled.View`
  height: 16px;
  width: 100%;
`

export const isResponseSlate = (slatePath: string) => slatePath.substr(-9) === '.response'

export const getSlatePath = (slateId: string, isResponse: boolean) => {
  return `${SLATES_DIRECTORY}/${slateId}.grinslate${isResponse ? '.response' : ''}`
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

export const Wrapper = styled(KeyboardAvoidingView)`
  padding: 0 16px;
  flex-grow: 1;
`

export const LoaderView = styled.View`
  flex-grow: 1;
  justify-content: center;
`

export const colors = {
  primary: '#ffdd57',
  warning: '#fa6800',
  success: '#2EB358',
  lightGrey: '#f8f8f8',
  grey: '#bbb',
  darkGrey: '#808080',
  darkestGrey: '#333',
  black: '#000',
}
