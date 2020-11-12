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

@objc(TorBridge)
class TorBridge: RCTEventEmitter {
    
    @objc override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc func startTor(_ state: String, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        var error: UInt8 = 0;
        let cResult = c_create_tor_config(state, &error)
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
    
    @objc func stopTor(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
        OnionConnector.shared.stop()
        OnionConnector.shared.removeObserver(self)
    }
    
    override func supportedEvents() -> [String]! {
        return [torStatusUpdateEventName]
      }
    
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

extension TorBridge:OnionConnectorObserver {

}
