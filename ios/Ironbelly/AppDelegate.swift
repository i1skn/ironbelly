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



import UIKit
import LaunchScreenSnapshot
import ExpoModulesCore
import React

@UIApplicationMain
class AppDelegate: EXAppDelegateWrapper, RCTBridgeDelegate, UIApplicationDelegate {
    
    var window: UIWindow?
    var bridge: RCTBridge!
    
    func sourceURL(for bridge: RCTBridge!) -> URL! {
    #if DEBUG
        return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
        Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
    }

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        c_set_logger()
        
        self.bridge = RCTBridge(delegate: self, launchOptions: launchOptions)
        let rootView = RCTRootView(bridge: self.bridge, moduleName: "Ironbelly", initialProperties: nil)
        let rootViewController = UIViewController()
        rootViewController.view = rootView
        
        self.window = UIWindow(frame: UIScreen.main.bounds)
        self.window?.rootViewController = rootViewController
        self.window?.makeKeyAndVisible()

        LaunchScreenSnapshot.protect(with: nil, trigger: .didEnterBackground)
        RNSplashScreen.show()
        
        return true
    }

    func application(_ app: UIApplication,
                            open url: URL,
                              options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        RCTLinkingManager.application(app, open: url, options: options)
        return true
    }
}
