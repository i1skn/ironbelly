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
        cstr_free(cResult)
}

@objc(GrinBridge)
class GrinBridge: RCTEventEmitter {
    
    @objc static override func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc func balance(_ account: String, password: String, checkNodeApiHttpAddr:String, refreshFromNode: Bool,resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let walletUrl = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var error: UInt8 = 0
            let cResult = c_balance(walletUrl.path, account, password, checkNodeApiHttpAddr, refreshFromNode, &error)
            returnToReact(error:error, cResult:cResult! , resolve: resolve, reject: reject)
        }
    }
    
    @objc func txsGet(_ account: String, password: String, checkNodeApiHttpAddr:String, refreshFromNode: Bool,resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let walletUrl = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var error: UInt8 = 0
            let cResult = c_txs_get(walletUrl.path, account, password, checkNodeApiHttpAddr, refreshFromNode, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }
    
    @objc func txGet(_ account: String, password: String, checkNodeApiHttpAddr:String, refreshFromNode: Bool, txId: UInt32, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let walletUrl = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var error: UInt8 = 0
            let cResult = c_tx_get(walletUrl.path, account, password, checkNodeApiHttpAddr, refreshFromNode, txId, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }
    
    @objc func txCreate(_ account: String, password: String, checkNodeApiHttpAddr:String, amount: UInt64, selectionStrategyIsUseAll: Bool, message: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let walletUrl = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var error: UInt8 = 0
            let cResult = c_tx_create(walletUrl.path, account, password, checkNodeApiHttpAddr, amount, selectionStrategyIsUseAll, message, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }
    
    @objc func txStrategies(_ account: String, password: String, checkNodeApiHttpAddr:String, amount: UInt64, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let walletUrl = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var error: UInt8 = 0
            let cResult = c_tx_strategies(walletUrl.path, account, password, checkNodeApiHttpAddr, amount, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
            
        }
    }
    
    @objc func txCancel(_ account: String, password: String, checkNodeApiHttpAddr:String, id: UInt32, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let walletUrl = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var error: UInt8 = 0
            let cResult = c_tx_cancel(walletUrl.path, account, password, checkNodeApiHttpAddr, id, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }
    
    @objc func txReceive(_ account: String, password: String, checkNodeApiHttpAddr:String, slatePath: String, message: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let walletUrl = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var error: UInt8 = 0
            let cResult = c_tx_receive(walletUrl.path, account, password, checkNodeApiHttpAddr, slatePath,message, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }
    
    @objc func txFinalize(_ account: String, password: String, checkNodeApiHttpAddr:String, slatePath: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let walletUrl = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var error: UInt8 = 0
            let cResult = c_tx_finalize(walletUrl.path, account, password, checkNodeApiHttpAddr, slatePath, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }
    
    @objc func walletInit(_ password: String, checkNodeApiHttpAddr:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let walletUrl = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var error: UInt8 = 0
            let cResult = c_wallet_init(walletUrl.path, password, checkNodeApiHttpAddr, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }
    
    @objc func walletPhrase(_ password: String, checkNodeApiHttpAddr:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let walletUrl = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var error: UInt8 = 0
            let cResult = c_wallet_phrase(walletUrl.path, password, checkNodeApiHttpAddr, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }
    
    @objc func walletRecovery(_ phrase: String, password: String, checkNodeApiHttpAddr:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let walletUrl = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var error: UInt8 = 0
            let cResult = c_wallet_recovery(walletUrl.path, phrase, password, checkNodeApiHttpAddr, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }
    
    @objc func checkPassword(_ password: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let walletUrl = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var error: UInt8 = 0
            let cResult = c_check_password(walletUrl.path, password, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }
    
    @objc open override func supportedEvents() -> [String] {
        return ["onRecoveryProgressUpdate"]
    }
}
