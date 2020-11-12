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

import Foundation

@objc(GrinBridge)
class GrinBridge: NSObject {

    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc func walletPmmrRange(_ state: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_wallet_pmmr_range(state, &error)
        returnToReact(error:error, cResult:cResult! , resolve: resolve, reject: reject)
    }
    
    @objc func setLogger(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_set_logger(&error)
        returnToReact(error:error, cResult:cResult! , resolve: resolve, reject: reject)
    }

    @objc func txsGet(_ state: String, refreshFromNode: Bool,resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_txs_get(state, refreshFromNode, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func txGet(_ state: String, refreshFromNode: Bool, txSlateId: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_tx_get(state, refreshFromNode, txSlateId, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func txPost(_ state: String, txSlateId: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_tx_post(state, txSlateId, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func txCreate(_ state: String, amount: UInt64, selectionStrategyIsUseAll: Bool, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_tx_create(state, amount, selectionStrategyIsUseAll, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func txSendHttps(_ state: String, amount: UInt64, selectionStrategyIsUseAll: Bool, url: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_tx_send_https(state, amount, selectionStrategyIsUseAll, url, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func txStrategies(_ state: String, amount: UInt64, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_tx_strategies(state, amount, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func txCancel(_ state: String, id: UInt32, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_tx_cancel(state, id, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func txReceive(_ state: String, slatepack: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_tx_receive(state, slatepack, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func txFinalize(_ state: String, slatepack: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_tx_finalize(state, slatepack, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)

    }

    @objc func seedNew(_ seedLength: UInt8, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_seed_new(seedLength, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func walletPhrase(_ state:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_wallet_phrase(state, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func checkPassword(_ state:String, password: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_check_password(state, password, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }


    @objc func walletInit(_ state:String, phrase: String, password: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_wallet_init(state, phrase, password, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func walletScanOutputs(_ state:String, lastRetrievedIndex: UInt64, highestIndex: UInt64, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_wallet_scan_outputs(state, lastRetrievedIndex, highestIndex, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }
    
    @objc func slatepackDecode(_ state:String, slatepack:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_slatepack_decode(state, slatepack, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }
    
    @objc func listenWithHttp(_ state:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_listen_with_http(state, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }
}
