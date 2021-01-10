package app.ironbelly;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.orhanobut.logger.Logger;

import android.util.Log;
import android.os.AsyncTask;

import androidx.annotation.Nullable;

import app.ironbelly.tor.TorConfig;
import app.ironbelly.tor.TorProxyManager;
import app.ironbelly.tor.TorProxyState;
import kotlin.Unit;

public class GrinBridge extends ReactContextBaseJavaModule {

    private Long openedWallet;
    private Long httpListenerApi;
    private TorProxyManager torProxyManager;

    static {
        System.loadLibrary("wallet");
    }

    @Override
    public String getName() {
        return "GrinBridge";
    }

    private boolean checkOpenedWallet(Promise promise) {
        if (openedWallet == null) {
            promise.resolve("Wallet is not open");
            return false;
        }
        return true;
    }

    public GrinBridge(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @ReactMethod
    public void openWallet(String config, String password, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    openedWallet = openWallet(config, password);
                    promise.resolve("Opened wallet successfully");
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void closeWallet(Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                if (checkOpenedWallet(promise)) {
                    try {
                        String result = closeWallet(openedWallet);
                        openedWallet = null;
                        promise.resolve(result);
                    } catch (Exception e) {
                        promise.reject("", e.getMessage());
                    }
                }
            }
        });
    }

    @ReactMethod
    public void setLogger(Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    promise.resolve(setLogger());
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void seedNew(double seedLength, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    promise.resolve(seedNew((long) seedLength));
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void walletInit(String config, String phrase, String password, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    promise.resolve(walletInit(config, phrase, password));
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void txGet(Boolean refreshFromNode, String txSlateId, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    if (checkOpenedWallet(promise)) {
                        promise.resolve(txGet(openedWallet, refreshFromNode, txSlateId));
                    }
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void txsGet(double minimumConfirmations, Boolean refreshFromNode, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    if (checkOpenedWallet(promise)) {
                        promise.resolve(txsGet(openedWallet, (long) minimumConfirmations, refreshFromNode));
                    }
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void walletPmmrRange(Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    if (checkOpenedWallet(promise)) {
                        promise.resolve(walletPmmrRange(openedWallet));
                    }
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void walletScanOutputs(double lastRetrievedIndex, double highestIndex,
            Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    if (checkOpenedWallet(promise)) {
                        promise.resolve(walletScanOutputs(openedWallet, (long) lastRetrievedIndex,
                                (long) highestIndex));
                    }
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void walletPhrase(String walletDir, String password, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    if (checkOpenedWallet(promise)) {
                        promise.resolve(walletPhrase(walletDir, password));
                    }
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void txStrategies(double amount, double minimumConfirmations, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    if (checkOpenedWallet(promise)) {
                        promise.resolve(txStrategies(openedWallet, (long) amount, (long) minimumConfirmations));
                    }
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void txCreate(double amount, double minimumConfirmations, Boolean selectionStrategyIsUseAll,
            Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    if (checkOpenedWallet(promise)) {
                        promise.resolve(txCreate(openedWallet, (long) amount, (long) minimumConfirmations, selectionStrategyIsUseAll));
                    }
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void txCancel(double id, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    if (checkOpenedWallet(promise)) {
                        promise.resolve(txCancel(openedWallet, (long) id));
                    }
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void txReceive(String account, String slatepack, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    if (checkOpenedWallet(promise)) {
                        promise.resolve(txReceive(openedWallet, account, slatepack));
                    }
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void txFinalize(String slatepack, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    if (checkOpenedWallet(promise)) {
                        promise.resolve(txFinalize(openedWallet, slatepack));
                    }
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void txSendAddress(double amount, double minimumConfirmations, Boolean selectionStrategyIsUseAll,
                            String address, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    if (checkOpenedWallet(promise)) {
                        promise.resolve(
                                txSendAddress(openedWallet, (long) amount, (long) minimumConfirmations, selectionStrategyIsUseAll, address));
                    }
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void txPost(String txSlateId, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    if (checkOpenedWallet(promise)) {
                        promise.resolve(txPost(openedWallet, txSlateId));
                    }
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void slatepackDecode(String slatepack, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    promise.resolve(slatepackDecode(slatepack));
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    @ReactMethod
    public void startListenWithHttp(String apiListenAddress, Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                if (httpListenerApi == null) {
                    try {
                        if (checkOpenedWallet(promise)) {
                            httpListenerApi = startListenWithHttp(openedWallet, apiListenAddress);
                            promise.resolve(getGrinAddress(openedWallet));
                        }
                    } catch (Exception e) {
                        promise.reject("", e.getMessage());
                    }
                } else {
                    promise.reject("", "Can not start HTTP listener as it's already running");

                }
            }
        });
    }

    @ReactMethod
    public void stopListenWithHttp(Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                if (httpListenerApi != null) {
                    try {
                        String result = stopListenWithHttp(httpListenerApi);
                        httpListenerApi = null;
                        promise.resolve(result);
                    } catch (Exception e) {
                        promise.reject("", e.getMessage());
                    }
                } else {
                    promise.resolve("No HTTP listener to stop");
                }
            }
        });
    }

    @ReactMethod
    public void startTor(Promise promise) {
        try {
            Log.d("openedWallet: %s", String.valueOf(openedWallet));
            String torListenAddress = "127.0.0.1:3415";
            createTorConfig(openedWallet, torListenAddress);
            TorConfig torConfig = new TorConfig(
                    39059,
                    "127.0.0.1",
                    39069,
                    "data/control_auth_cookie"
            );
            ReactContext reactContext = GrinBridge.super.getReactApplicationContext();
            torProxyManager = new TorProxyManager(reactContext, torConfig);
            Thread thread = new Thread(){
                public void run(){
                    torProxyManager.subscribeToTorProxyState(this, torProxyState -> {
                        String status = null;

                        if (torProxyState instanceof TorProxyState.Failed) {
                            status = "failed";
                        }
                        if (torProxyState instanceof TorProxyState.NotReady) {
                            status = "disconnected";
                        }
                        if (torProxyState instanceof TorProxyState.Initializing) {
                            status = "in-progress";
                        }
                        if (torProxyState instanceof TorProxyState.Running) {
                            status = "connected";
                        }
                        if (status != null) {
                            reactContext
                                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                    .emit("TorStatusUpdate", status);
                        }
                        return Unit.INSTANCE;
                    });
                    torProxyManager.run();
                    promise.resolve("Run successfully");
                }
            };
            thread.start();
        } catch (Exception e) {
            promise.reject("", e.getMessage());
        }
    }

    @ReactMethod
    public void stopTor(Promise promise) {
        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                try {
                    if (torProxyManager != null) {
                        torProxyManager.shutdown();
                    }
                    promise.resolve("Done");
                } catch (Exception e) {
                    promise.reject("", e.getMessage());
                }
            }
        });
    }

    private static native String setLogger();

    private static native String balance(String state, boolean refreshFromNode);

    private static native String txGet(long openedWallet, boolean refreshFromNode, String txSlateId);

    private static native String txsGet(long openedWallet, long minimumConfirmations, boolean refreshFromNode);

    private static native String seedNew(long seedLength);

    private static native String walletInit(String config, String phrase, String password);

    private static native long openWallet(String config, String password);

    private static native String closeWallet(long openedWallet);

    private static native String walletScanOutputs(long openedWallet, long lastRetrievedIndex,
            long highestIndex);

    private static native String walletPmmrRange(long openedWallet);

    private static native String txStrategies(long openedWallet, long amount, long minimumConfirmations);

    private static native String walletPhrase(String walletDir, String password);

    private static native String txCreate(long openedWallet, long amount, long minimumConfirmations,
            boolean selectionStrategyIsUseAll);

    private static native String txCancel(long openedWallet, long id);

    private static native String txReceive(long openedWallet, String account, String slatepack);

    private static native String txFinalize(long openedWallet, String slatepack);

    private static native String txSendAddress(long openedWallet, long amount, long minimumConfirmations, boolean selectionStrategyIsUseAll, String address);

    private static native String txPost(long openedWallet, String txSlateId);

    private static native String slatepackDecode(String slatepack);

    private static native String getGrinAddress(long openedWallet);

    private static native long startListenWithHttp(long openedWallet, String apiListenAddr);

    private static native String stopListenWithHttp(long apiServer);

    private static native String createTorConfig(long wallet, String listenAddress);

}
