//  OnionSettings.swift
/*
    Package MobileWallet
    Created by S.Shovkoplyas on 01.09.2020
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

@objc class BridgesConfuguration: NSObject, Codable {

    enum CodingKeys: CodingKey {
        case bridges, customBridges
    }

    var bridgesType: OnionSettings.BridgesType
    var customBridges: [String]?

    init(bridges: OnionSettings.BridgesType, customBridges: [String]?) {
        self.bridgesType = bridges
        self.customBridges = customBridges
    }

// MARK: Codable confirmation
    required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        bridgesType = OnionSettings.BridgesType(rawValue: try container.decode(Int.self, forKey: .bridges)) ?? .none
        customBridges = try container.decode([String]?.self, forKey: .customBridges)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(bridgesType.rawValue, forKey: .bridges)
        try container.encode(customBridges, forKey: .customBridges)
    }
}


class OnionSettings: NSObject {
    static let torBridgesLink = URL(string: "https://bridges.torproject.org/bridges")!

    enum BridgesType: Int {
        case none
        case custom
    }

    private enum BridgesConfigurationKey: String {
        case backup = "backup_bridges"
        case current = "use_bridges"
    }

    static let defaultBridgesConfiguration: BridgesConfuguration = BridgesConfuguration(bridges: .none, customBridges: nil)

    class var backupBridgesConfiguration: BridgesConfuguration {
        get {
            return getBridgesConfiguration(for: .backup)
        }
        set {
            setBridgesConfiguration(newValue, for: .backup)
        }
    }

    class var currentlyUsedBridgesConfiguration: BridgesConfuguration {
        get {
            return getBridgesConfiguration(for: .current)
        }
        set {
            setBridgesConfiguration(newValue, for: .current)
        }
    }

    private class func setBridgesConfiguration(_ configuration: BridgesConfuguration, for key: BridgesConfigurationKey) {
        let encoder = JSONEncoder()
        if let encoded = try? encoder.encode(configuration) {
            UserDefaults.standard.set(encoded, forKey: key.rawValue)
        }
    }

    private class func getBridgesConfiguration(for key: BridgesConfigurationKey) -> BridgesConfuguration {
        let decoder = JSONDecoder()
        if let configurationData = UserDefaults.standard.object(forKey: key.rawValue) as? Data,
           let decodedConfiguration = try? decoder.decode(BridgesConfuguration.self, from: configurationData) {
            return decodedConfiguration
        }
        return defaultBridgesConfiguration
    }
}
