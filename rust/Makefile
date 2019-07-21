NDK_STANDALONE = $(HOME)/.NDK
ARCHS_IOS = x86_64-apple-ios aarch64-apple-ios
ARCHS_ANDROID = aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
# ARCHS_ANDROID = aarch64-linux-android
# ARCHS_ANDROID = i686-linux-android
# ARCHS_ANDROID = x86_64-linux-android
# ARCHS_ANDROID = armv7-linux-androideabi
LIB=libwallet.a

all: ios android

ios: $(LIB)

android: $(ARCHS_ANDROID)
	sh copy_android.sh

.PHONY: $(ARCHS_IOS)
$(ARCHS_IOS): %:
	cargo build --target $@ --release --no-default-features

aarch64-linux-android:
	PATH=$(PATH):$(NDK_STANDALONE)/arm64/bin \
	CC=$@-clang \
	CXX=$@-g++ \
	cargo build --target $@ --release --lib

armv7-linux-androideabi:
	PATH=$(PATH):$(NDK_STANDALONE)/arm/bin \
	CC=arm-linux-androideabi-clang \
	CXX=arm-linux-androideabi-g++ \
	cargo build --target $@ --release --lib

i686-linux-android:
	PATH=$(PATH):$(NDK_STANDALONE)/x86/bin \
	CC=$@-clang \
	CXX=$@-g++ \
	cargo build --target $@ --release --lib

x86_64-linux-android:
	PATH=$(PATH):$(NDK_STANDALONE)/x86_64/bin \
	CC=$@-clang \
	CXX=$@-g++ \
	cargo build --target $@ --release --lib


$(LIB): $(ARCHS_IOS)
	lipo -create -output $@ $(foreach arch,$(ARCHS_IOS),$(wildcard target/$(arch)/release/$(LIB)))
