#! /bin/bash

mkdir -p ../android/app/src/main/jniLibs/x86
mkdir -p ../android/app/src/main/jniLibs/x86_64
mkdir -p ../android/app/src/main/jniLibs/arm64-v8a
mkdir -p ../android/app/src/main/jniLibs/armeabi-v7a

cp ./target/i686-linux-android/release/libwallet.so ../android/app/src/main/jniLibs/x86/libwallet.so
cp ./target/x86_64-linux-android/release/libwallet.so ../android/app/src/main/jniLibs/x86_64/libwallet.so
cp ./target/aarch64-linux-android/release/libwallet.so ../android/app/src/main/jniLibs/arm64-v8a/libwallet.so
cp ./target/armv7-linux-androideabi/release/libwallet.so ../android/app/src/main/jniLibs/armeabi-v7a/libwallet.so
