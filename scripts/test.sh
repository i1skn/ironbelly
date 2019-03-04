#!/bin/bash -e

brew unlink applesimutils && brew link applesimutils
cd ios/
pod install
cd ..
npm install -g react-native-cli
npm install -g detox-cli
detox build --configuration ios.sim.release > /dev/null
# detox clean-framework-cache && detox build-framework-cache
detox test --configuration ios.sim.release --cleanup
