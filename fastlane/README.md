fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew install fastlane`

# Available Actions
## iOS
### ios bump
```
fastlane ios bump
```
Push a new beta build to TestFlight
### ios beta
```
fastlane ios beta
```


----

## Android
### android alpha
```
fastlane android alpha
```
Submit a new Alpha Build to Play Market
### android internal
```
fastlane android internal
```
Submit a new Internal Build to Play Market
### android apk
```
fastlane android apk
```
Build Release APK

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
