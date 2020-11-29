#!/bin/bash
source ./scripts/variables.sh

mode=$1
platform=$2
if [ -z "$mode" ] || [ "$mode" != "debug" -a "$mode" != "release" ] ; then
    echo "Please specify configuration ('debug' or 'release')" 1>&2
    exit 1
fi
if [ "$mode" == "debug" ] ; then
  rust_mode=""
else 
  rust_mode="--release"
fi
if [ -z "$platform" ] || [ "$platform" == "android" ] || [ "$platform" == "all" ] ; then
  if [ -z ${ANDROID_NDK_HOME+x} ];
    then
      printf 'Please install android-ndk\n\n'
      printf 'from https://developer.android.com/ndk/downloads or with sdkmanager'
      exit 1
    else
      printf "Building Andriod targets in $mode mode...\n";
  fi
  printf "Building ARM64 Android target...\n";
  # needed for rust-bindgen
  CLANG_PATH="${ANDROID_PREBUILD_BIN}/aarch64-linux-android${API_LEVEL}-clang" \
  CC_aarch64_linux_android="${ANDROID_PREBUILD_BIN}/aarch64-linux-android${API_LEVEL}-clang" \
  CXX_aarch64_linux_android="${ANDROID_PREBUILD_BIN}/aarch64-linux-android${API_LEVEL}-clang++" \
  CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER="${ANDROID_PREBUILD_BIN}/aarch64-linux-android${API_LEVEL}-clang" \
  AR_aarch64_linux_android="${ANDROID_PREBUILD_BIN}/aarch64-linux-android-ar" \
    cargo build --target aarch64-linux-android $rust_mode --lib

  printf "Building ARMv7 Android target...\n";
  # needed for rust-bindgen
  CLANG_PATH="${ANDROID_PREBUILD_BIN}/armv7a-linux-androideabi${API_LEVEL}-clang" \
  CC_armv7_linux_androideabi="${ANDROID_PREBUILD_BIN}/armv7a-linux-androideabi${API_LEVEL}-clang" \
  CXX_armv7_linux_androideabi="${ANDROID_PREBUILD_BIN}/armv7a-linux-androideabi${API_LEVEL}-clang++" \
  CARGO_TARGET_ARMV7_LINUX_ANDROIDEABI_LINKER="${ANDROID_PREBUILD_BIN}/armv7a-linux-androideabi${API_LEVEL}-clang" \
  AR_armv7_linux_androideabi="${ANDROID_PREBUILD_BIN}/arm-linux-androideabi-ar" \
    cargo build --target armv7-linux-androideabi $rust_mode --lib

  printf "Building 64-bit x86 Android target...\n";
  # needed for rust-bindgen
  CLANG_PATH="${ANDROID_PREBUILD_BIN}/x86_64-linux-android${API_LEVEL}-clang" \
  CC_x86_64_linux_android="${ANDROID_PREBUILD_BIN}/x86_64-linux-android${API_LEVEL}-clang" \
  CXX_x86_64_linux_android="${ANDROID_PREBUILD_BIN}/x86_64-linux-android${API_LEVEL}-clang++" \
  CARGO_TARGET_X86_64_LINUX_ANDROID_LINKER="${ANDROID_PREBUILD_BIN}/x86_64-linux-android${API_LEVEL}-clang" \
  AR_x86_64_linux_android="${ANDROID_PREBUILD_BIN}/x86_64-linux-android-ar" \
    cargo  build --target x86_64-linux-android $rust_mode --lib

  for i in "${!ANDROID_ARCHS[@]}";
    do
      mkdir -p -v "../android/app/src/main/jniLibs/${ANDROID_FOLDER[$i]}"
      cp "./target/${ANDROID_ARCHS[$i]}/$mode/lib${LIB_NAME}.so" "../android/app/src/main/jniLibs/${ANDROID_FOLDER[$i]}/lib${LIB_NAME}.so"
  done
fi

if [ -z "$platform" ] || [ "$platform" == "ios" ] || [ "$platform" == "all" ] ; then
  printf "Building iOS targets in $mode mode...\n";
  for i in "${IOS_ARCHS[@]}";
    do
      printf "Building $i target...\n";
      cargo build --target "$i" $rust_mode --no-default-features
  done

  lipo -create -output "../ios/lib${LIB_NAME}.a" target/x86_64-apple-ios/$mode/lib${LIB_NAME}.a  target/aarch64-apple-ios/$mode/lib${LIB_NAME}.a
fi
