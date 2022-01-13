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
#if DEBUG
#if FB_SONARKIT_ENABLED
import FlipperKit
#endif
#endif
import LaunchScreenSnapshot
import Expo

@UIApplicationMain
class AppDelegate: EXAppDelegateWrapper, RCTBridgeDelegate {
    func sourceURL(for bridge: RCTBridge!) -> URL! {
    #if DEBUG
        return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index", fallbackResource: nil)
    #else
        return RCTBundleURLProvider.sharedSettings().jsBundleURL(
            forFallbackResource: "main", fallbackExtension: "jsbundle"
        )
    #endif
    }

    override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        initializeFlipper(with: application)
        c_set_logger()
        
        let bridge = self.reactDelegate.createBridge(with: self, launchOptions: launchOptions)
        let rootView = self.reactDelegate.createRootView(with: bridge, moduleName: "Ironbelly", initialProperties: nil)
        let rootViewController = self.reactDelegate.createRootViewController()
        rootViewController.view = rootView
        
        self.window = UIWindow(frame: UIScreen.main.bounds)
        self.window?.rootViewController = rootViewController
        self.window?.makeKeyAndVisible()

        LaunchScreenSnapshot.protect(with: nil, trigger: .didEnterBackground)
        RNSplashScreen.show()
        super.application(application, didFinishLaunchingWithOptions: launchOptions)
        return true
    }

    override func application(_ app: UIApplication,
                            open url: URL,
                              options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        RCTLinkingManager.application(app, open: url, options: options)
        return true
    }

    private func initializeFlipper(with application: UIApplication) {
        #if DEBUG
        #if FB_SONARKIT_ENABLED
        let client = FlipperClient.shared()
        let layoutDescriptorMapper = SKDescriptorMapper(defaults: ())
        FlipperKitLayoutComponentKitSupport.setUpWith(layoutDescriptorMapper)
        client?.add(FlipperKitLayoutPlugin(rootNode: application, with: layoutDescriptorMapper!))
        client?.add(FKUserDefaultsPlugin(suiteName: nil))
        client?.add(FlipperKitReactPlugin())
        client?.add(FlipperKitNetworkPlugin(networkAdapter: SKIOSNetworkAdapter()))
        client?.add(FlipperReactPerformancePlugin.sharedInstance())
        client?.start()
        #endif
        #endif
    }
}
