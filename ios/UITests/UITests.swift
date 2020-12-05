//
//  UITests.swift
//  UITests
//
//  Created by Ivan Sorokin on 29.11.20.
//  Copyright © 2020 Ivan Sorokin. All rights reserved.
//

import XCTest

class UITests: XCTestCase {

    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.

        // In UI tests it is usually best to stop immediately when a failure occurs.
        continueAfterFailure = false

        // In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testSnapshots() throws {
        // UI tests must launch the application that they test.
        let app = XCUIApplication()
        setupSnapshot(app)
        app.launch()

        XCUIApplication().otherElements["UnlockBtn"].waitForExistence(timeout: 30)
        XCUIApplication().otherElements["UnlockBtn"].tap()
        snapshot("01OverviewScreen")
        
        //XCUIApplication().otherElements["SendTab"].waitForExistence(timeout: 30)
        XCUIApplication().otherElements["SendTab"].tap()
        snapshot("02SendScreen")
        XCUIApplication().otherElements["GoBackChevron"].tap()

        
        //XCUIApplication().otherElements["ReceiveTab"].waitForExistence(timeout: 30)
        XCUIApplication().otherElements["ReceiveTab"].tap()
        snapshot("03ReceiveScreen")
        XCUIApplication().otherElements["GoBackChevron"].tap()

        
//        XCUIApplication().otherElements["SettingsTab"].waitForExistence(timeout: 30)
        XCUIApplication().otherElements["SettingsTab"].tap()
        snapshot("04SettingsScreen")
    }
    
//    func testLaunchPerformance() throws {
//        if #available(macOS 10.15, iOS 13.0, tvOS 13.0, *) {
//            // This measures how long it takes to launch your application.
//            measure(metrics: [XCTApplicationLaunchMetric()]) {
//                XCUIApplication().launch()
//            }
//        }
//    }
}
