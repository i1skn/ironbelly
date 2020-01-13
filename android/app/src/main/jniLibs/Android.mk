LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

LOCAL_MODULE            := libwallet
LOCAL_SRC_FILES         := $(TARGET_ARCH_ABI)/libwallet.so
LOCAL_LDLIBS            := -llog
include $(PREBUILT_SHARED_LIBRARY)
