[![Build Status](https://travis-ci.com/cyclefortytwo/ironbelly.svg?branch=master)](https://travis-ci.com/cyclefortytwo/ironbelly)
[![Join the chat at https://gitter.im/ironbelly-wallet/community](https://badges.gitter.im/ironbelly-wallet/community.svg)](https://gitter.im/ironbelly-wallet/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Ironbelly

Named after a species of dragon - [Ukrainian Ironbelly](http://harrypotter.wikia.com/wiki/Ukrainian_Ironbelly). One of them guarded some of the oldest and deepest vaults in Gringotts.
This wallet uses React-Native for the UI and official [Grin](https://github.com/mimblewimble/grin/) source code written in Rust.
## Beta testing
Join iOS beta testing - [https://testflight.apple.com/join/GrqGPx9W](https://testflight.apple.com/join/GrqGPx9W)
## Contributing
### Set up the environment

Let's install Xcode build tools first

`xcode-select --install`

then install Rust

`curl https://sh.rustup.rs -sSf | sh`

add iOS architectures to rustup

`rustup target add aarch64-apple-ios x86_64-apple-ios`

install cargo-lipo, which is a cargo subcommand which automatically creates a universal library for use with iOS

`cargo install cargo-lipo`

### Build the project

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

## License

Apache License v2.0.
