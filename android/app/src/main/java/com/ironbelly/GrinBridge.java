package com.ironbelly;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class GrinBridge extends ReactContextBaseJavaModule {

  static {
    System.loadLibrary("wallet");
  }

  @Override
  public String getName() {
    return "GrinBridge";
  }

  public GrinBridge(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @ReactMethod
  public void walletPhrase(String seed, String message, Promise promise) {
    promise.resolve("dela");
  }

  @ReactMethod
  public void checkPassword(String state, String password, Promise promise) {
    try {
      promise.resolve(checkPassword(state, password));
    } catch (Exception e) {
      promise.reject("", e.getMessage());
    }
  }

  @ReactMethod
  public void balance(String state, Boolean refreshFromNode, Promise promise) {
    try {
      promise.resolve(balance(state, refreshFromNode));
    } catch (Exception e) {
      promise.reject("", e.getMessage());
    }
  }

  @ReactMethod
  public void seedNew(int seedLength, Promise promise) {
    try {
      promise.resolve(seedNew(seedLength));
    } catch (Exception e) {
      promise.reject("", e.getMessage());
    }
  }

  @ReactMethod
  public void walletInit(String state, String phrase, String password, Promise promise) {
    try {
      promise.resolve(walletInit(state, phrase, password));
    } catch (Exception e) {
      promise.reject("", e.getMessage());
    }
  }

  @ReactMethod
  public void txsGet(String state, Boolean refreshFromNode, Promise promise) {
    try {
      promise.resolve(txsGet(state, refreshFromNode));
    } catch (Exception e) {
      promise.reject("", e.getMessage());
    }
  }

  @ReactMethod
  public void walletRecovery(String state, int startIndex, int limit, Promise promise) {
    try {
      promise.resolve(walletRecovery(state, startIndex, limit));
    } catch (Exception e) {
      promise.reject("", e.getMessage());
    }
  }

  private static native String balance(String state, Boolean refreshFromNode);

  private static native String txsGet(String state, Boolean refreshFromNode);

  private static native String seedNew(int seedLength);

  private static native String walletInit(String state, String phrase, String password);

  private static native String checkPassword(String state, String password);

  private static native String walletRecovery(String state, int startIndex, int limit);
}
