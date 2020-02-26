NDK_STANDALONE = $(ANDROID_NDK)/toolchains/llvm/prebuilt/darwin-x86_64/bin

ARCHS_IOS = x86_64-apple-ios aarch64-apple-ios
# ARCHS_IOS = aarch64-apple-ios
ARCHS_ANDROID = aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
# ARCHS_ANDROID = aarch64-linux-android
# ARCHS_ANDROID = i686-linux-android
# ARCHS_ANDROID = x86_64-linux-android
# ARCHS_ANDROID = armv7-linux-androideabi
LIB=libwallet.a

ifdef release 
MODE= --release
else
MODE=
endif

test:

all: ios android

ios: $(LIB)

android: $(ARCHS_ANDROID)
ifdef release 
	sh copy_android.sh release
else
	sh copy_android.sh debug
endif


.PHONY: $(ARCHS_IOS)
$(ARCHS_IOS): %:
	cargo build --target $@ $(MODE)

aarch64-linux-android:
	PATH=$(PATH):$(NDK_STANDALONE) \
	CC=$@28-clang \
	CXX=$@28-clang++ \
	cargo build --target $@ $(MODE) --lib

armv7-linux-androideabi:
	PATH=$(PATH):$(NDK_STANDALONE) \
	CC=armv7a-linux-androideabi28-clang \
	CXX=armv7a-linux-androideabi28-clang++ \
	cargo build --target $@ $(MODE) --lib

i686-linux-android:
	PATH=$(PATH):$(NDK_STANDALONE) \
	CC=$@28-clang \
	CXX=$@28-clang++ \
	cargo build --target $@ $(MODE) --lib
x86_64-linux-android:
	PATH=$(PATH):$(NDK_STANDALONE) \
	CC=$@28-clang \
	CXX=$@28-clang++ \
	cargo build --target $@ $(MODE) --lib


$(LIB): $(ARCHS_IOS)
ifdef release 
	lipo -create -output $@ $(foreach arch,$(ARCHS_IOS),$(wildcard target/$(arch)/release/$(LIB)))
else
	lipo -create -output $@ $(foreach arch,$(ARCHS_IOS),$(wildcard target/$(arch)/debug/$(LIB)))
endif
