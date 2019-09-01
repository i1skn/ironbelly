[![Build Status](https://travis-ci.com/cyclefortytwo/ironbelly.svg?branch=master)](https://travis-ci.com/cyclefortytwo/ironbelly)
[![Join the chat at https://gitter.im/ironbelly-wallet/community](https://badges.gitter.im/ironbelly-wallet/community.svg)](https://gitter.im/ironbelly-wallet/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

<a href="https://apps.apple.com/us/app/ironbelly/id1475413396" target="_blank"><img height="75" src="https://ironbelly.app/assets/appstore.png"></a>

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

install cargo-lipo, which is a cargo subcommand which automatically creates a universal library for use with iOS

`cargo install cargo-lipo`

#### Build the project

```
# Clone this repo somewhere
git clone --recurse-submodules https://github.com/cyclefortytwo/ironbelly.git # it uses submodules
cd ironbelly
# Build staticlib from Rust Grin code
# All Rust related code lives in `rust/` directory
cd rust
cargo lipo --release
cd ..
npm install
# All iOS related code lives in `ios/` directory
cd ios/
sudo gem install cocoapods
pod install
cd ..
npm start # this will start React Native server
```

After all of these, please open `ios/Ironbelly.xcworkspace` in XCode and run `Product -> Build (⌘B)`

### Android
#### Set up the environment

Install needed dependencies for React-Native

https://facebook.github.io/react-native/docs/getting-started#installing-dependencies-1

add iOS architectures to rustup

`rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android`

install Android NDK
```
mkdir ~/.NDK
cd $(ANDROID_HOME)/ndk/<your_version>/build/tools
./make_standalone_toolchain.py --api 29 --arch arm64 --install-dir ~/.NDK/arm64;
./make_standalone_toolchain.py --api 29 --arch arm --install-dir ~/.NDK/arm;
./make_standalone_toolchain.py --api 29 --arch x86 --install-dir ~/.NDK/x86;
```
create a file `~/.cargo/config` with the following content:
```
[target.aarch64-linux-android]
ar = ".NDK/arm64/bin/aarch64-linux-android-ar"
linker = ".NDK/arm64/bin/aarch64-linux-android-clang"

[target.armv7-linux-androideabi]
ar = ".NDK/arm/bin/arm-linux-androideabi-ar"
linker = ".NDK/arm/bin/arm-linux-androideabi-clang"

[target.i686-linux-android]
ar = ".NDK/x86/bin/i686-linux-android-ar"
linker = ".NDK/x86/bin/i686-linux-android-clang"
```

#### Build the project
Run Android emulator or connect a real device. Now `adb devices` should show at least one device.

Go to the root of the repo and run `react-native run-android`

## Beta testing
### iOS - Testflight
[https://testflight.apple.com/join/GrqGPx9W](https://testflight.apple.com/join/GrqGPx9W)
### Android
Coming soon!

## License

Apache License v2.0.
