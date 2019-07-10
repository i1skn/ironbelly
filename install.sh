#!/bin/sh
JNI_LIBS=$(pwd)/android/app/src/main/jniLibs

cd rust
cargo build --target i686-linux-android --release

mkdir -p $JNI_LIBS/x86

ln -s $(pwd)/target/i686-linux-android/release/libwallet.a $JNI_LIBS/x86/libwallet.a
