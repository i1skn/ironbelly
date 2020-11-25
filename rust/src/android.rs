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
    state_json: JString,
    phrase: JString,
    password: JString,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    let phrase: String = env.get_string(phrase).expect("Invalid phrase").into();
    let password: String = env.get_string(password).expect("Invalid password").into();
    unwrap_to_jni!(env, wallet_init(&state_json, &phrase, &password))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txGet(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
    refresh_from_node: bool,
    tx_slate_id: JString,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    let tx_slate_id: String = env
        .get_string(tx_slate_id)
        .expect("Invalid tx_slate_id")
        .into();
    unwrap_to_jni!(env, tx_get(&state_json, refresh_from_node, &tx_slate_id))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txsGet(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
    refresh_from_node: bool,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    unwrap_to_jni!(env, txs_get(&state_json, refresh_from_node))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_openWallet(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
    password: JString,
) -> jlong {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    let password: String = env.get_string(password).expect("Invalid password").into();
    match open_wallet(&state_json, ZeroingString::from(password)) {
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
    opened_wallet: jlong,
) -> jstring {
    if let Some(wallet) = (opened_wallet as *mut Wallet).as_mut() {
        let result = close_wallet(&wallet);
        if result.is_ok() {
            Box::from_raw(wallet);
        };
        unwrap_to_jni!(env, result)
    } else {
        let _ = env.throw(serde_json::to_string(&format!("Can not close wallet")).unwrap());
        env.new_string("").unwrap().into_inner()
    }
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_walletPmmrRange(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    unwrap_to_jni!(env, wallet_pmmr_range(&state_json))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_walletScanOutputs(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
    last_retrieved_index: jlong,
    highest_index: jlong,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    unwrap_to_jni!(
        env,
        wallet_scan_outputs(
            &state_json,
            last_retrieved_index as u64,
            highest_index as u64
        )
    )
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_walletPhrase(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    unwrap_to_jni!(env, wallet_phrase(&state_json))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txStrategies(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
    amount: jlong,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    unwrap_to_jni!(env, tx_strategies(&state_json, amount as u64))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txCreate(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
    amount: jlong,
    selection_strategy_is_use_all: bool,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    unwrap_to_jni!(
        env,
        tx_create(&state_json, amount as u64, selection_strategy_is_use_all)
    )
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txCancel(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
    id: jlong,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    unwrap_to_jni!(env, tx_cancel(&state_json, id as u32,))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txReceive(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
    slate_armored: JString,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    let slate_armored: String = env
        .get_string(slate_armored)
        .expect("Invalid slate_armored")
        .into();
    unwrap_to_jni!(env, tx_receive(&state_json, &slate_armored))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txFinalize(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
    slate_armored: JString,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    let slate_armored: String = env
        .get_string(slate_armored)
        .expect("Invalid slate_armored")
        .into();
    unwrap_to_jni!(env, tx_finalize(&state_json, &slate_armored))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txSendHttps(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
    amount: jlong,
    selection_strategy_is_use_all: bool,
    url: JString,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    let url: String = env.get_string(url).expect("Invalid url").into();
    unwrap_to_jni!(
        env,
        tx_send_https(
            &state_json,
            &url,
            amount as u64,
            selection_strategy_is_use_all
        )
    )
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txSendAddress(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
    amount: jlong,
    selection_strategy_is_use_all: bool,
    address: JString,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    let address: String = env.get_string(address).expect("Invalid url").into();
    unwrap_to_jni!(
        env,
        tx_send_address(
            &state_json,
            &address,
            amount as u64,
            selection_strategy_is_use_all
        )
    )
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txPost(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
    tx_slate_id: JString,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    let tx_slate_id: String = env
        .get_string(tx_slate_id)
        .expect("Invalid tx_slate_id")
        .into();
    unwrap_to_jni!(env, tx_post(&state_json, &tx_slate_id))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_slatepackDecode(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
    slatepack: JString,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    let slatepack: String = env.get_string(slatepack).expect("Invalid slatepack").into();
    unwrap_to_jni!(env, slatepack_decode(&state_json, &slatepack))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_getGrinAddress(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
) -> jstring {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    unwrap_to_jni!(env, get_grin_address(&state_json))
}

#[no_mangle]
pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_startListenWithHttp(
    env: JNIEnv,
    _: JClass,
    state_json: JString,
) -> jlong {
    let state_json: String = env.get_string(state_json).expect("Invalid state").into();
    let mut apis = ApiServer::new();
    if let Err(e) = start_listen_with_http(&state_json, &mut apis) {
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
    wallet: jlong,
    listen_addr: JString,
) -> jstring {
    // Implement this when TOR is ready
    env.new_string("").unwrap().into_inner()
}
