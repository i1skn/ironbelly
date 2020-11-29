#!/bin/bash

# Change this name to the rust library name
LIB_NAME=wallet
API_LEVEL=29

ANDROID_ARCHS=(aarch64-linux-android armv7-linux-androideabi x86_64-linux-android)
ANDROID_FOLDER=(arm64-v8a armeabi-v7a x86_64)
ANDROID_BIN_PREFIX=(aarch64-linux-android armv7a-linux-androideabi x86_64-linux-android)
IOS_ARCHS=(aarch64-apple-ios x86_64-apple-ios)
OS_ARCH=$(uname | tr '[:upper:]' '[:lower:]')

ANDROID_PREBUILD_BIN=${ANDROID_NDK_HOME}/toolchains/llvm/prebuilt/${OS_ARCH}-x86_64/bin

