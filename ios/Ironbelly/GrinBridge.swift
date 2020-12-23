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

let torStatusUpdateEventName = "TorStatusUpdate"
let torListenAddress = "127.0.0.1:3415"

@objc(GrinBridge)
class GrinBridge: RCTEventEmitter {
    
    var httpListenerApi: UInt? // UnsafeMutablePointer<api_server>?
    var openedWallet: UInt?
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return false
    }

    @objc func walletInit(_ config:String, phrase: String, password: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_wallet_init(config, phrase, password, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }
    
    @objc func openWallet(_ config:String, password: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_open_wallet(config, password, &error)
        if (error == 0) {
            openedWallet = cResult
            resolve(true)
        } else {
            reject(nil, String(cString: UnsafePointer<UInt8>(bitPattern: cResult)!), nil)
        }
    }
    
    @objc func closeWallet(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            let cResult = c_close_wallet(wallet, &error)
            if (error == 0) {
                openedWallet = nil
            }
            returnToReact(error:error, cResult:cResult! , resolve: resolve, reject: reject)
        }
    }
    
    @objc func startTor(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0;
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            let cResult = c_create_tor_config(wallet, torListenAddress, &error)
            let result = String(cString: cResult!)
            if error == 0 {
                OnionConnector.shared.addObserver(self)
                OnionConnector.shared.start()
                resolve(result)
            } else {
                reject(nil, result, nil)
            }
            cstr_free(UnsafeMutablePointer(mutating: cResult))
        }
    }
    
    @objc func stopTor(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        OnionConnector.shared.stop()
        OnionConnector.shared.removeObserver(self)
    }
    
    @objc func walletPmmrRange(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            let cResult = c_wallet_pmmr_range(wallet, &error)
            returnToReact(error:error, cResult:cResult! , resolve: resolve, reject: reject)
        }
    }

    @objc func txsGet(_ minimumConfirmations: UInt64, refreshFromNode: Bool,resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            let cResult = c_txs_get(wallet, minimumConfirmations, refreshFromNode, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }

    @objc func txGet(_ refreshFromNode: Bool, txSlateId: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            let cResult = c_tx_get(wallet, refreshFromNode, txSlateId, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }

    @objc func txPost(_ txSlateId: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            let cResult = c_tx_post(wallet, txSlateId, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }

    @objc func txCreate(_ amount: UInt64, minimumConfirmations: UInt64, selectionStrategyIsUseAll: Bool, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            let cResult = c_tx_create(wallet, amount, minimumConfirmations, selectionStrategyIsUseAll, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }

    @objc func txSendHttps(_ amount: UInt64, minimumConfirmations: UInt64, selectionStrategyIsUseAll: Bool, url: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            var error: UInt8 = 0
            let cResult = c_tx_send_https(wallet, amount, minimumConfirmations, selectionStrategyIsUseAll, url, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }
    
    @objc func txSendAddress(_ amount: UInt64, minimumConfirmations: UInt64, selectionStrategyIsUseAll: Bool, address: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            var error: UInt8 = 0
            let cResult = c_tx_send_address(wallet, amount, minimumConfirmations, selectionStrategyIsUseAll, address, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }

    @objc func txStrategies(_ amount: UInt64, minimumConfirmations: UInt64, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            var error: UInt8 = 0
            let cResult = c_tx_strategies(wallet, amount, minimumConfirmations, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }

    @objc func txCancel(_ id: UInt32, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            var error: UInt8 = 0
            let cResult = c_tx_cancel(wallet, id, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }

    @objc func txReceive(_ account: String, slatepack: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            var error: UInt8 = 0
            let cResult = c_tx_receive(wallet, account, slatepack, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }

    @objc func txFinalize(_ slatepack: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            var error: UInt8 = 0
            let cResult = c_tx_finalize(wallet, slatepack, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }

    @objc func seedNew(_ seedLength: UInt8, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_seed_new(seedLength, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }

    @objc func walletPhrase(_ walletDir: String, password:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_wallet_phrase(walletDir, password, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }


    @objc func walletScanOutputs(_ lastRetrievedIndex: UInt64, highestIndex: UInt64, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        if let wallet = checkOpenedWallet(openedWallet, reject) {
            var error: UInt8 = 0
            let cResult = c_wallet_scan_outputs(wallet, lastRetrievedIndex, highestIndex, &error)
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        }
    }
    
    @objc func slatepackDecode(slatepack:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        let cResult = c_slatepack_decode(slatepack, &error)
        returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
    }
    
    @objc func startListenWithHttp(_ apiListenAddress:String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        if httpListenerApi == nil {
            if let wallet = checkOpenedWallet(openedWallet, reject) {
                httpListenerApi = c_start_listen_with_http(wallet,apiListenAddress, &error)
                if error == 0 {
                    let cResult = c_get_grin_address(wallet, &error)
                    returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
                } else {
                    reject(nil, "Can not start HTTP server. See logs.", nil)
                }
            }
        } else {
            reject(nil, "Can not start HTTP listener as it's already running", nil)
        }

    }
    
    @objc func stopListenWithHttp(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0
        if let api = httpListenerApi {
            let cResult = c_stop_listen_with_http(api, &error)
            httpListenerApi = nil;
            returnToReact(error:error, cResult:cResult!, resolve: resolve, reject: reject)
        } else {
            resolve("No HTTP listener to stop")
        }
    }
    
    override func supportedEvents() -> [String]! {
        return [torStatusUpdateEventName]
    }
}

extension GrinBridge:OnionConnectorObserver {
    func onTorConnProgress(_ progress: Int) {
        self.sendEvent( withName: torStatusUpdateEventName, body: "in-progress" )
    }
    func onTorConnFinished(_ configuration: BridgesConfuguration) {
        self.sendEvent( withName: torStatusUpdateEventName, body: "connected" )
    }
    func onTorConnDifficulties(error: OnionError) {
        logTor("Difficulties: \(error)")
        self.sendEvent( withName: torStatusUpdateEventName, body: "failed" )
    }
    func onTorPortsOpened() {
        logTor("Ports are opened")
    }
}
