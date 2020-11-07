//  OnionConnecter.swift

/*
    Package MobileWallet
    Created by Jason van den Berg on 2020/03/02
    Using Swift 5.0
    Running on macOS 10.15

    Copyright 2019 The Tari Project

    Redistribution and use in source and binary forms, with or
    without modification, are permitted provided that the
    following conditions are met:

    1. Redistributions of source code must retain the above copyright notice,
    this list of conditions and the following disclaimer.

    2. Redistributions in binary form must reproduce the above
    copyright notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

    3. Neither the name of the copyright holder nor the names of
    its contributors may be used to endorse or promote products
    derived from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
    CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
    INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
    OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
    CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
    SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
    NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
    HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
    CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
    OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import Foundation

protocol OnionConnectorObserver: OnionManagerDelegate {
    func onTorConnDifficulties()
}
extension OnionConnectorObserver {
    func onTorConnProgress(_ progress: Int) { }
    func onTorConnFinished(_ configuration: BridgesConfuguration) { }
    func onTorConnDifficulties() { }
    func onTorConnDifficulties(error: OnionError) { }
    func onTorPortsOpened() { }
}

public final class OnionConnector {
    public static let shared = OnionConnector()
    private var torObservers = NSPointerArray.weakObjects()

    var connectionState: OnionManager.TorState {
        return OnionManager.shared.state
    }

    var bridgesConfiguration: BridgesConfuguration {
        get {
            OnionSettings.currentlyUsedBridgesConfiguration
        }

        set {
            OnionSettings.backupBridgesConfiguration = bridgesConfiguration
            OnionManager.shared.setBridgeConfiguration(bridgesType: newValue.bridgesType, customBridges: newValue.customBridges)
            OnionManager.shared.stopTor {
                OnionManager.shared.startTor(delegate: self)
            }
        }
    }

    private init() {}

    public func start() {
        OnionManager.shared.startTor(delegate: self)
    }

    public func restoreBridgeConfiguration() {
        bridgesConfiguration = OnionSettings.backupBridgesConfiguration
    }

    public func stop() {
        OnionManager.shared.stopTor()
    }

    func addObserver(_ observer: OnionConnectorObserver) {
        torObservers.addObject(observer)
    }

    func removeObserver(_ observer: OnionConnectorObserver) {
        torObservers.remove(observer)
    }
}

extension OnionConnector: OnionManagerDelegate {

    func onTorConnProgress(_ progress: Int) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.torObservers.allObjects.forEach {
                if let object = $0 as? OnionConnectorObserver {
                    object.onTorConnProgress(progress)
                }
            }
        }
    }

    func onTorConnFinished(_ configuration: BridgesConfuguration) {
        OnionSettings.backupBridgesConfiguration = configuration
        OnionSettings.currentlyUsedBridgesConfiguration = configuration

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.torObservers.allObjects.forEach {
                if let object = $0 as? OnionConnectorObserver {
                    object.onTorConnFinished(configuration)
                }
            }
        }
    }

    func onTorConnDifficulties(error: OnionError) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.torObservers.allObjects.forEach {
                if let object = $0 as? OnionConnectorObserver {
                    object.onTorConnDifficulties(error: error)
                    object.onTorConnDifficulties()
                }
            }
        }
    }

    func onTorPortsOpened() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.torObservers.allObjects.forEach {
                if let object = $0 as? OnionConnectorObserver {
                    object.onTorPortsOpened()
                }
            }
        }
    }
}

