package com.ironbelly;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.wix.RNCameraKit.RNCameraKitPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.horcrux.svg.SvgPackage;
import com.rnfingerprint.FingerprintAuthPackage;
import com.oblador.keychain.KeychainPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.rnfs.RNFSPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.bugsnag.BugsnagReactNative;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNCameraKitPackage(),
            new NetInfoPackage(),
            new KCKeepAwakePackage(),
            new SvgPackage(),
            new FingerprintAuthPackage(),
            new KeychainPackage(),
            new VectorIconsPackage(),
            new RNGestureHandlerPackage(),
            new RNFSPackage(),
            new RNDeviceInfo(),
            BugsnagReactNative.getPackage(),
            new AsyncStoragePackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
