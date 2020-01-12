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


import Foundation

func returnToReact(error: UInt8, cResult: UnsafePointer<Int8>, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {

    let result = String(cString: cResult)
    if error == 0 {
        resolve(result)
    } else {
        reject(nil, result, nil)
    }
    cstr_free(UnsafeMutablePointer(mutating: cResult))
}

@objc(GrinBridge)
class GrinBridge: NSObject {

    @objc static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc func balance(_ state: String, refreshFromNode: Bool,resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_balance(state, refreshFromNode, &error)
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

    @objc func txCreate(_ state: String, amount: UInt64, selectionStrategyIsUseAll: Bool, message: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_tx_create(state, amount, selectionStrategyIsUseAll, message, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func txSendHttps(_ state: String, amount: UInt64, selectionStrategyIsUseAll: Bool, message: String, url: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_tx_send_https(state, amount, selectionStrategyIsUseAll, message, url, &error)
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

    @objc func txReceive(_ state: String, slatePath: String, message: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_tx_receive(state, slatePath, message, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func txFinalize(_ state: String, slatePath: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_tx_finalize(state, slatePath, &error)
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

    @objc func walletScan(_ state:String, startIndex: UInt64, limit: UInt64, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_wallet_scan(state , startIndex, limit, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }
}
