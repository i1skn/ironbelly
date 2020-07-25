<a href="https://apps.apple.com/us/app/ironbelly/id1475413396" target="_blank"><img height="75" src="https://ironbelly.app/assets/appstore.png"></a>&nbsp;&nbsp;&nbsp;
<a href="https://play.google.com/store/apps/details?id=app.ironbelly"><img height="75" src="https://ironbelly.app/assets/playstore.png"/></a>&nbsp;&nbsp;&nbsp;
<a href="https://ironbelly.app/apks/ironbelly-3.1.0b23.apk"><img height="75" src="https://ironbelly.app/assets/apk.png"/></a>


# Ironbelly

Named after a species of dragon - [Ukrainian Ironbelly](http://harrypotter.wikia.com/wiki/Ukrainian_Ironbelly). One of them guarded some of the oldest and deepest vaults in Gringotts.
This wallet uses React-Native for the UI and official [Grin](https://github.com/mimblewimble/grin/) source code written in Rust.

## Contributing
### Install Rust
`curl https://sh.rustup.rs -sSf | sh`

### Set up the environment

Go to project directory and run:
```
cd rust
./scripts/init.sh // add needed targets for rust
```

### iOS

Let's install Xcode build tools first

`xcode-select --install`


#### Build the project

Go to project directory and run:
```
cd rust
./scripts/build.sh release ios 
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

Install Android SDK / NDK / Platform Tools
```
brew cask install android-sdk android-ndk android-platform-tools
```

Add to your `.bashprofile` or `.zshrc`:
```
export ANDROID_HOME="$(brew --prefix)/share/android-sdk"
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools
export ANDROID_NDK_HOME="$(brew --prefix)/share/android-ndk"
```

#### Build the project
Run Android emulator or connect a real device. Now `adb devices` should show at least one device.

```
cd rust
./scripts/build.sh release android 
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
