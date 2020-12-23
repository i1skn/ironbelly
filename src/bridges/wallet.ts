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

import { NativeModules } from 'react-native'
import Config from 'react-native-config'
import { WALLET_DATA_DIRECTORY } from 'src/common'
import RNFS from 'react-native-fs'
import { mockedRustTransactions } from 'src/mocks'

interface IGrinBridge {
  seedNew: (length: number) => Promise<string>
  isWalletCreated: () => Promise<boolean>
  walletInit: (
    config: string,
    phrase: string,
    password: string,
  ) => Promise<string>
  openWallet: (config: string, password: string) => Promise<string>
  closeWallet: () => Promise<string>
  startTor: () => Promise<string>
  stopTor: () => Promise<string>
  walletPmmrRange: () => Promise<string>
  txsGet: (
    minimumConfirmations: number,
    refreshFromNode: boolean,
  ) => Promise<string>
  txGet: (refreshFromNode: boolean, slateId: string) => Promise<string>
  txPost: (slateId: string) => Promise<string>
  txCreate: (
    amount: number,
    minimumConfirmations: number,
    selectionStrategyIsUseAll: boolean,
  ) => Promise<string>
  txSendHttps: (
    amount: number,
    minimumConfirmations: number,
    selectionStrategyIsUseAll: boolean,
    url: string,
  ) => Promise<string>
  txSendAddress: (
    amount: number,
    minimumConfirmations: number,
    selectionStrategyIsUseAll: boolean,
    address: string,
  ) => Promise<string>
  txStrategies: (
    amount: number,
    minimumConfirmations: number,
  ) => Promise<string>
  txCancel: (id: number) => Promise<string>
  txReceive: (account: string, slatepack: string) => Promise<string>
  txFinalize: (slatepack: string) => Promise<string>
  walletPhrase: (walletDir: string, password: string) => Promise<string>
  walletScanOutputs: (
    lastRetrievedIndex: number,
    highestIndex: number,
  ) => Promise<string>
  slatepackDecode: (slatepack: string) => Promise<string>
  startListenWithHttp: (apiListenAddress: string) => Promise<string>
  stopListenWithHttp: () => Promise<string>
}

declare module 'react-native' {
  interface NativeModulesStatic {
    GrinBridge: IGrinBridge
  }
}

const { GrinBridge } = NativeModules

let WalletBridge: IGrinBridge
if (Config.DEMO_MODE) {
  WalletBridge = {
    ...GrinBridge,
    // Wallet
    openWallet: () => Promise.resolve(''),
    closeWallet: () => Promise.resolve(''),
    // Tor
    startTor: () => Promise.resolve(''),
    stopTor: () => Promise.resolve(''),
    // Http listener
    startListenWithHttp: () =>
      Promise.resolve('grin1<some digits/letters here>'),
    stopListenWithHttp: () => Promise.resolve(''),
    // Transactions
    txsGet: () =>
      Promise.resolve(
        JSON.stringify([
          true,
          Object.values(mockedRustTransactions),
          {
            amount_awaiting_confirmation: '0',
            amount_awaiting_finalization: '0',
            amount_currently_spendable: '104751338749',
            amount_immature: '0',
            amount_locked: '0',
            amount_reverted: '0',
            last_confirmed_height: '986000',
            minimum_confirmations: '10',
            total: '104751338749',
          },
        ]),
      ),
    isWalletCreated: () => Promise.resolve(true),
  }
} else {
  WalletBridge = {
    ...GrinBridge,
    isWalletCreated: () => {
      const seedFilePath = WALLET_DATA_DIRECTORY + '/wallet.seed'
      return RNFS.exists(seedFilePath)
    },
  }
}

export default WalletBridge
