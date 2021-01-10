/**
 * Copyright 2020 Ironbelly Devs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
extern crate android_logger;
extern crate jni;

use self::jni::objects::{JClass, JString};
use self::jni::sys::{jlong, jstring};
use self::jni::JNIEnv;
use super::*;

macro_rules! unwrap_to_jni (
    ($env:expr, $func:expr) => (
        match $func {
            Ok(res) => {
                $env.new_string(res).unwrap().into_inner()
            }
            Err(e) => {
                let result = $env.new_string("").unwrap().into_inner();
                $env.throw(serde_json::to_string(&format!("{}",e)).unwrap()).unwrap();
                result
            }
        }
    )
);

macro_rules! ensure_wallet (
    ($wallet_ptr:expr, $wallet:ident, $env:expr) => (
        if ($wallet_ptr as *mut Wallet).as_mut().is_none() {
            let _ = $env.throw(serde_json::to_string(&format!("Wallet is NULL")).unwrap());
            return $env.new_string("").unwrap().into_inner();
        }
        let $wallet = ($wallet_ptr as *mut Wallet).as_mut().unwrap();
    )
);

macro_rules! get_string_from_jni (
    ($str:ident, $env:expr) => (
        let $str: String = $env.get_string($str).expect("Invalid string").into();
    )
);

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_setLogger(
    env: JNIEnv,
    _: JClass,
) -> jstring {
    android_logger::init_once(
        android_logger::Config::default()
            .with_min_level(if cfg!(debug_assertions) {
                log::Level::Debug
            } else {
                log::Level::Info
            })
            .with_tag("Ironbelly"),
    );
    env.new_string("Logger initiated successfully!")
        .unwrap()
        .into_inner()
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_seedNew(
    env: JNIEnv,
    _: JClass,
    seed_length: jlong,
) -> jstring {
    unwrap_to_jni!(
        env,
        WalletSeed::init_new(seed_length as usize, false, None).to_mnemonic()
    )
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_walletInit(
    env: JNIEnv,
    _: JClass,
    config_str: JString,
    phrase: JString,
    password: JString,
) -> jstring {
    get_string_from_jni!(config_str, env);
    get_string_from_jni!(phrase, env);
    get_string_from_jni!(password, env);
    unwrap_to_jni!(env, wallet_init(&config_str, &phrase, &password))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txGet(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: jlong,
    refresh_from_node: bool,
    tx_slate_id: JString,
) -> jstring {
    ensure_wallet!(wallet_ptr, wallet, env);
    get_string_from_jni!(tx_slate_id, env);
    unwrap_to_jni!(env, tx_get(&wallet, refresh_from_node, &tx_slate_id))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txsGet(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: jlong,
    minimum_confirmations: jlong,
    refresh_from_node: bool,
) -> jstring {
    ensure_wallet!(wallet_ptr, wallet, env);
    unwrap_to_jni!(
        env,
        txs_get(&wallet, minimum_confirmations as u64, refresh_from_node)
    )
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_openWallet(
    env: JNIEnv,
    _: JClass,
    config_str: JString,
    password: JString,
) -> jlong {
    get_string_from_jni!(config_str, env);
    get_string_from_jni!(password, env);
    match open_wallet(&config_str, &password) {
        Ok(res) => Box::into_raw(Box::new(res)) as jlong,
        Err(e) => {
            let _ = env.throw(serde_json::to_string(&format!("{}", e)).unwrap());
            0 as jlong
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_closeWallet(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: jlong,
) -> jstring {
    ensure_wallet!(wallet_ptr, wallet, env);
    let result = close_wallet(&wallet);
    if result.is_ok() {
        Box::from_raw(wallet);
    };
    unwrap_to_jni!(env, result)
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_walletPmmrRange(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: jlong,
) -> jstring {
    ensure_wallet!(wallet_ptr, wallet, env);
    unwrap_to_jni!(env, wallet_pmmr_range(&wallet))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_walletScanOutputs(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: jlong,
    last_retrieved_index: jlong,
    highest_index: jlong,
) -> jstring {
    ensure_wallet!(wallet_ptr, wallet, env);
    unwrap_to_jni!(
        env,
        wallet_scan_outputs(&wallet, last_retrieved_index as u64, highest_index as u64)
    )
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_walletPhrase(
    env: JNIEnv,
    _: JClass,
    wallet_dir: JString,
    password: JString,
) -> jstring {
    get_string_from_jni!(wallet_dir, env);
    get_string_from_jni!(password, env);
    unwrap_to_jni!(env, wallet_phrase(&wallet_dir, &password))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txStrategies(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: jlong,
    amount: jlong,
    minimum_confirmations: jlong,
) -> jstring {
    ensure_wallet!(wallet_ptr, wallet, env);
    unwrap_to_jni!(
        env,
        tx_strategies(&wallet, amount as u64, minimum_confirmations as u64)
    )
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txCreate(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: jlong,
    amount: jlong,
    minimum_confirmations: jlong,
    selection_strategy_is_use_all: bool,
) -> jstring {
    ensure_wallet!(wallet_ptr, wallet, env);
    unwrap_to_jni!(
        env,
        tx_create(
            &wallet,
            amount as u64,
            minimum_confirmations as u64,
            selection_strategy_is_use_all
        )
    )
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txCancel(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: jlong,
    id: jlong,
) -> jstring {
    ensure_wallet!(wallet_ptr, wallet, env);
    unwrap_to_jni!(env, tx_cancel(&wallet, id as u32,))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txReceive(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: jlong,
    account: JString,
    slate_armored: JString,
) -> jstring {
    ensure_wallet!(wallet_ptr, wallet, env);
    get_string_from_jni!(slate_armored, env);
    get_string_from_jni!(account, env);
    unwrap_to_jni!(env, tx_receive(&wallet, &account, &slate_armored))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txFinalize(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: jlong,
    slate_armored: JString,
) -> jstring {
    ensure_wallet!(wallet_ptr, wallet, env);
    get_string_from_jni!(slate_armored, env);
    unwrap_to_jni!(env, tx_finalize(&wallet, &slate_armored))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txSendAddress(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: jlong,
    amount: jlong,
    minimum_confirmations: jlong,
    selection_strategy_is_use_all: bool,
    address: JString,
) -> jstring {
    ensure_wallet!(wallet_ptr, wallet, env);
    get_string_from_jni!(address, env);
    unwrap_to_jni!(
        env,
        tx_send_address(
            &wallet,
            &address,
            amount as u64,
            minimum_confirmations as u64,
            selection_strategy_is_use_all
        )
    )
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txPost(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: jlong,
    tx_slate_id: JString,
) -> jstring {
    ensure_wallet!(wallet_ptr, wallet, env);
    get_string_from_jni!(tx_slate_id, env);
    unwrap_to_jni!(env, tx_post(&wallet, &tx_slate_id))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_slatepackDecode(
    env: JNIEnv,
    _: JClass,
    slatepack: JString,
) -> jstring {
    get_string_from_jni!(slatepack, env);
    unwrap_to_jni!(env, slatepack_decode(&slatepack))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_getGrinAddress(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: jlong,
) -> jstring {
    ensure_wallet!(wallet_ptr, wallet, env);
    unwrap_to_jni!(env, get_grin_address(&wallet))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_startListenWithHttp(
    env: JNIEnv,
    _: JClass,
    wallet_ptr: usize,
    api_listen_addr: JString,
) -> jlong {
    if (wallet_ptr as *mut Wallet).as_mut().is_none() {
        let _ = env.throw(serde_json::to_string(&format!("Wallet is NULL")).unwrap());
    }
    let wallet = (wallet_ptr as *mut Wallet).as_mut().unwrap();
    get_string_from_jni!(api_listen_addr, env);
    let mut apis = ApiServer::new();
    if let Err(e) = start_listen_with_http(&wallet, &api_listen_addr, &mut apis) {
        let _ = env.throw(serde_json::to_string(&format!("{}", e)).unwrap());
    }
    Box::into_raw(Box::new(apis)) as jlong
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_stopListenWithHttp(
    env: JNIEnv,
    _: JClass,
    api_server: jlong,
) -> jstring {
    if let Some(apis) = (api_server as *mut ApiServer).as_mut() {
        apis.stop();
        Box::from_raw(api_server as *mut ApiServer);
        env.new_string("").unwrap().into_inner()
    } else {
        let _ = env.throw(serde_json::to_string(&format!("Api server is NULL")).unwrap());
        env.new_string("").unwrap().into_inner()
    }
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_createTorConfig(
    env: JNIEnv,
    _: JClass,
    opened_wallet: jlong,
    listen_addr: JString,
) -> jstring {
    let listen_addr: String = env
        .get_string(listen_addr)
        .expect("Invalid listen addr")
        .into();
    if let Some(wallet) = (opened_wallet as *mut Wallet).as_mut() {
        unwrap_to_jni!(env, create_tor_config(&wallet, &listen_addr))
    } else {
        let _ = env.throw(serde_json::to_string(&format!("Opened wallet is empty")).unwrap());
        env.new_string("").unwrap().into_inner()
    }
}
