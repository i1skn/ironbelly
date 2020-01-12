[![Build Status](https://travis-ci.com/cyclefortytwo/ironbelly.svg?branch=master)](https://travis-ci.com/cyclefortytwo/ironbelly)
[![Join the chat at https://gitter.im/ironbelly-wallet/community](https://badges.gitter.im/ironbelly-wallet/community.svg)](https://gitter.im/ironbelly-wallet/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<a href="https://apps.apple.com/us/app/ironbelly/id1475413396" target="_blank"><img height="75" src="https://ironbelly.app/assets/appstore.png"></a>&nbsp;&nbsp;&nbsp;
<a href="https://play.google.com/store/apps/details?id=app.ironbelly"><img height="75" src="https://ironbelly.app/assets/playstore.png"/></a>


# Ironbelly

Named after a species of dragon - [Ukrainian Ironbelly](http://harrypotter.wikia.com/wiki/Ukrainian_Ironbelly). One of them guarded some of the oldest and deepest vaults in Gringotts.
This wallet uses React-Native for the UI and official [Grin](https://github.com/mimblewimble/grin/) source code written in Rust.

## Contributing
### Install Rust
`curl https://sh.rustup.rs -sSf | sh`


### iOS
#### Set up the environment

Let's install Xcode build tools first

`xcode-select --install`

add iOS architectures to rustup

`rustup target add aarch64-apple-ios x86_64-apple-ios`

`rustup toolchain install 1.39.0`

install cargo-lipo, which is a cargo subcommand which automatically creates a universal library for use with iOS

`cargo install cargo-lipo`

#### Build the project

```
# Clone this repo somewhere
git clone --recurse-submodules https://github.com/i1skn/ironbelly.git # it uses submodules
cd ironbelly
# Build staticlib from Rust Grin code
# All Rust related code lives in `rust/` directory
cd rust
make ios
# All iOS related code lives in `ios/` directory
cd ../ios
sudo gem install cocoapods
pod install
cd ..
npm install
npm start # this will start React Native server
```

After all of these, please open `ios/Ironbelly.xcworkspace` in XCode and run `Product -> Build (⌘B)`

### Android
#### Set up the environment

Install needed dependencies for React-Native

https://facebook.github.io/react-native/docs/getting-started#installing-dependencies-1

add Android architectures to rustup

`rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android`

Install Android SDK / NDK / Platform Tools
```
brew cask install android-sdk android-ndk android-platform-tools
```

Install [Android Studio](https://developer.android.com/studio)

Add to your `.bashprofile` or `.zshrc`:
```
export ANDROID_HOME="$(brew --prefix)/share/android-sdk"
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools
export ANDROID_NDK="$(brew --prefix)/share/android-ndk"
```

Create `~/.cargo/config` file with the following content:
```
[target.aarch64-linux-android]
ar = "/usr/local/share/android-ndk/toolchains/llvm/prebuilt/darwin-x86_64/bin/aarch64-linux-android-ar"
linker = "/usr/local/share/android-ndk/toolchains/llvm/prebuilt/darwin-x86_64/bin/aarch64-linux-android28-clang"

[target.armv7-linux-androideabi]
ar = "/usr/local/share/android-ndk/toolchains/llvm/prebuilt/darwin-x86_64/bin/arm-linux-androideabi-ar"
linker = "/usr/local/share/android-ndk/toolchains/llvm/prebuilt/darwin-x86_64/bin/armv7a-linux-androideabi28-clang"

[target.i686-linux-android]
ar = "/usr/local/share/android-ndk/toolchains/llvm/prebuilt/darwin-x86_64/bin/i686-linux-android-ar"
linker = "/usr/local/share/android-ndk/toolchains/llvm/prebuilt/darwin-x86_64/bin/i686-linux-android28-clang"

[target.x86_64-linux-android]
ar = "/usr/local/share/android-ndk/toolchains/llvm/prebuilt/darwin-x86_64/bin/x86_64-linux-android-ar"
linker = "/usr/local/share/android-ndk/toolchains/llvm/prebuilt/darwin-x86_64/bin/x86_64-linux-android28-clang"
```

#### Build the project
Run Android emulator or connect a real device. Now `adb devices` should show at least one device.

``
# Clone this repo somewhere
git clone --recurse-submodules https://github.com/i1skn/ironbelly.git # it uses submodules
cd ironbelly
# Build staticlib from Rust Grin code
# All Rust related code lives in `rust/` directory
cd rust
make android
cd ..
npm install
```
Go to the root of the repo and run `react-native run-android`

## Beta testing
### iOS - Testflight
[https://testflight.apple.com/join/GrqGPx9W](https://testflight.apple.com/join/GrqGPx9W)
### Android
[https://play.google.com/store/apps/details?id=app.ironbelly](https://play.google.com/store/apps/details?id=app.ironbelly)

## License

Apache License v2.0.
