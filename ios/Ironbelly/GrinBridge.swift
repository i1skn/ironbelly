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

@objc(GrinBridge)
class GrinBridge: RCTEventEmitter {
    
    @objc static override func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc func balance(_ account: String, password: String, checkNodeApiHttpAddr:String, refreshFromNode: Bool,resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet_url = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var path_ptr = wallet_url.path.asPtr()
            var account_ptr = account.asPtr()
            var password_ptr = password.asPtr()
            var check_node_api_http_addr_ptr = checkNodeApiHttpAddr.asPtr()
            var error: UInt8 = 0
            let result_rust_str = c_balance(&path_ptr, &account_ptr, &password_ptr, &check_node_api_http_addr_ptr, refreshFromNode, &error)
            let result_rust_str_ptr = rust_string_ptr(result_rust_str)
            let result = String.fromStringPtr(ptr: result_rust_str_ptr!.pointee)
            if error == 0 {
                resolve(result)
            } else {
                reject(nil, result, nil)
            }
            rust_string_ptr_destroy(result_rust_str_ptr)
            rust_string_destroy(result_rust_str)
        }
    }
    
    @objc func txsGet(_ account: String, password: String, checkNodeApiHttpAddr:String, refreshFromNode: Bool,resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet_url = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var path_ptr = wallet_url.path.asPtr()
            var account_ptr = account.asPtr()
            var password_ptr = password.asPtr()
            var check_node_api_http_addr_ptr = checkNodeApiHttpAddr.asPtr()
            var error: UInt8 = 0
            let result_rust_str = c_txs_get(&path_ptr, &account_ptr, &password_ptr, &check_node_api_http_addr_ptr, refreshFromNode, &error)
            let result_rust_str_ptr = rust_string_ptr(result_rust_str)
            let result = String.fromStringPtr(ptr: result_rust_str_ptr!.pointee)
            if error == 0 {
                resolve(result)
            } else {
                reject(nil, result, nil)
            }
            rust_string_ptr_destroy(result_rust_str_ptr)
            rust_string_destroy(result_rust_str)
        }
    }
    
    @objc func txGet(_ account: String, password: String, checkNodeApiHttpAddr:String, refreshFromNode: Bool, txId: UInt32, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet_url = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var path_ptr = wallet_url.path.asPtr()
            var account_ptr = account.asPtr()
            var password_ptr = password.asPtr()
            var check_node_api_http_addr_ptr = checkNodeApiHttpAddr.asPtr()
            var error: UInt8 = 0
            let result_rust_str = c_tx_get(&path_ptr, &account_ptr, &password_ptr, &check_node_api_http_addr_ptr, refreshFromNode, txId, &error)
            let result_rust_str_ptr = rust_string_ptr(result_rust_str)
            let result = String.fromStringPtr(ptr: result_rust_str_ptr!.pointee)
            if error == 0 {
                resolve(result)
            } else {
                reject(nil, result, nil)
            }
            rust_string_ptr_destroy(result_rust_str_ptr)
            rust_string_destroy(result_rust_str)
        }
    }
    
    @objc func txCreate(_ account: String, password: String, checkNodeApiHttpAddr:String, amount: UInt64, selectionStrategyIsUseAll: Bool, message: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet_url = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var path_ptr = wallet_url.path.asPtr()
            var account_ptr = account.asPtr()
            var password_ptr = password.asPtr()
            var check_node_api_http_addr_ptr = checkNodeApiHttpAddr.asPtr()
            var message_ptr = message.asPtr()
            var error: UInt8 = 0
            let result_rust_str = c_tx_create(&path_ptr, &account_ptr, &password_ptr, &check_node_api_http_addr_ptr, amount, selectionStrategyIsUseAll, &message_ptr, &error)
            let result_rust_str_ptr = rust_string_ptr(result_rust_str)
            let result = String.fromStringPtr(ptr: result_rust_str_ptr!.pointee)
            if error == 0 {
                resolve(result)
            } else {
                reject(nil, result, nil)
            }
            rust_string_ptr_destroy(result_rust_str_ptr)
            rust_string_destroy(result_rust_str)
            
        }
    }
    
    @objc func txStrategies(_ account: String, password: String, checkNodeApiHttpAddr:String, amount: UInt64, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet_url = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var path_ptr = wallet_url.path.asPtr()
            var account_ptr = account.asPtr()
            var password_ptr = password.asPtr()
            var check_node_api_http_addr_ptr = checkNodeApiHttpAddr.asPtr()
            var error: UInt8 = 0
            let result_rust_str = c_tx_strategies(&path_ptr, &account_ptr, &password_ptr, &check_node_api_http_addr_ptr, amount, &error)
            let result_rust_str_ptr = rust_string_ptr(result_rust_str)
            let result = String.fromStringPtr(ptr: result_rust_str_ptr!.pointee)
            if error == 0 {
                resolve(result)
            } else {
                reject(nil, result, nil)
            }
            rust_string_ptr_destroy(result_rust_str_ptr)
            rust_string_destroy(result_rust_str)
            
        }
    }
    
    @objc func txCancel(_ account: String, password: String, checkNodeApiHttpAddr:String, id: UInt32, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet_url = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var path_ptr = wallet_url.path.asPtr()
            var account_ptr = account.asPtr()
            var password_ptr = password.asPtr()
            var check_node_api_http_addr_ptr = checkNodeApiHttpAddr.asPtr()
            var error: UInt8 = 0
            let result_rust_str = c_tx_cancel(&path_ptr, &account_ptr, &password_ptr, &check_node_api_http_addr_ptr, id, &error)
            let result_rust_str_ptr = rust_string_ptr(result_rust_str)
            let result = String.fromStringPtr(ptr: result_rust_str_ptr!.pointee)
            if error == 0 {
                resolve(result)
            } else {
                reject(nil, result, nil)
            }
            rust_string_ptr_destroy(result_rust_str_ptr)
            rust_string_destroy(result_rust_str)
        }
    }
    
    @objc func txReceive(_ account: String, password: String, checkNodeApiHttpAddr:String, slate_path: String, message: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet_url = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var path_ptr = wallet_url.path.asPtr()
            var account_ptr = account.asPtr()
            var password_ptr = password.asPtr()
            var check_node_api_http_addr_ptr = checkNodeApiHttpAddr.asPtr()
            var slate_path_ptr = slate_path.asPtr()
            var message_ptr = message.asPtr()
            var error: UInt8 = 0
            let result_rust_str = c_tx_receive(&path_ptr, &account_ptr, &password_ptr, &check_node_api_http_addr_ptr, &slate_path_ptr,&message_ptr, &error)
            let result_rust_str_ptr = rust_string_ptr(result_rust_str)
            let result = String.fromStringPtr(ptr: result_rust_str_ptr!.pointee)
            if error == 0 {
                resolve(result)
            } else {
                reject(nil, result, nil)
            }
            rust_string_ptr_destroy(result_rust_str_ptr)
            rust_string_destroy(result_rust_str)
        }
    }
    
    @objc func txFinalize(_ account: String, password: String, checkNodeApiHttpAddr:String, slate_path: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet_url = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var path_ptr = wallet_url.path.asPtr()
            var account_ptr = account.asPtr()
            var password_ptr = password.asPtr()
            var check_node_api_http_addr_ptr = checkNodeApiHttpAddr.asPtr()
            var slate_path_ptr = slate_path.asPtr()
            var error: UInt8 = 0
            let result_rust_str = c_tx_finalize(&path_ptr, &account_ptr, &password_ptr, &check_node_api_http_addr_ptr, &slate_path_ptr, &error)
            let result_rust_str_ptr = rust_string_ptr(result_rust_str)
            let result = String.fromStringPtr(ptr: result_rust_str_ptr!.pointee)
            if error == 0 {
                resolve(result)
            } else {
                reject(nil, result, nil)
            }
            rust_string_ptr_destroy(result_rust_str_ptr)
            rust_string_destroy(result_rust_str)
        }
    }
    
    @objc func walletInit(_ password: String, checkNodeApiHttpAddr:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet_url = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var path_ptr = wallet_url.path.asPtr()
            var password_ptr = password.asPtr()
            var check_node_api_http_addr_ptr = checkNodeApiHttpAddr.asPtr()
            var error: UInt8 = 0
            let result_rust_str = c_wallet_init(&path_ptr, &password_ptr, &check_node_api_http_addr_ptr, &error)
            let result_rust_str_ptr = rust_string_ptr(result_rust_str)
            let result = String.fromStringPtr(ptr: result_rust_str_ptr!.pointee)
            if error == 0 {
                resolve(result)
            } else {
                reject(nil, result, nil)
            }
            rust_string_ptr_destroy(result_rust_str_ptr)
            rust_string_destroy(result_rust_str)
        }
    }
    
    @objc func walletPhrase(_ password: String, checkNodeApiHttpAddr:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet_url = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            var path_ptr = wallet_url.path.asPtr()
            var password_ptr = password.asPtr()
            var check_node_api_http_addr_ptr = checkNodeApiHttpAddr.asPtr()
            var error: UInt8 = 0
            let result_rust_str = c_wallet_phrase(&path_ptr, &password_ptr, &check_node_api_http_addr_ptr, &error)
            let result_rust_str_ptr = rust_string_ptr(result_rust_str)
            let result = String.fromStringPtr(ptr: result_rust_str_ptr!.pointee)
            if error == 0 {
                resolve(result)
            } else {
                reject(nil, result, nil)
            }
            rust_string_ptr_destroy(result_rust_str_ptr)
            rust_string_destroy(result_rust_str)
        }
    }
    
    @objc func walletRecovery(_ phrase: String, password: String, checkNodeApiHttpAddr:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet_url = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first {
            
            var path_ptr = wallet_url.path.asPtr()
            var phrase_ptr = phrase.asPtr()
            var password_ptr = password.asPtr()
            var check_node_api_http_addr_ptr = checkNodeApiHttpAddr.asPtr()
            var error: UInt8 = 0
            let result_rust_str = c_wallet_recovery(&path_ptr, &phrase_ptr, &password_ptr, &check_node_api_http_addr_ptr, &error)
            let result_rust_str_ptr = rust_string_ptr(result_rust_str)
            let result = String.fromStringPtr(ptr: result_rust_str_ptr!.pointee)
            if error == 0 {
                resolve(result)
            } else {
                reject(nil, result, nil)
            }
            rust_string_ptr_destroy(result_rust_str_ptr)
            rust_string_destroy(result_rust_str)
        }
    }
    
    @objc open override func supportedEvents() -> [String] {
        return ["onRecoveryProgressUpdate"]
    }
}
