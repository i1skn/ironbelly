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
use super::*;
use grin_wallet_util::grin_util::ZeroingString;
use simplelog::{Config, LevelFilter, SimpleLogger};
use std::ffi::{CStr, CString};
use std::os::raw::c_char;

macro_rules! unwrap_to_c (
    ($func:expr, $error:expr) => (
        match $func {
            Ok(res) => {
                *$error = 0;
                CString::new(res.to_owned()).unwrap().into_raw()
            }
            Err(e) => {
                *$error = 1;
                CString::new(
                    serde_json::to_string(&format!("{}",e)).unwrap()).unwrap().into_raw()
            }
        }
        ));

fn cstr_to_rust(s: *const c_char) -> String {
    unsafe { CStr::from_ptr(s).to_string_lossy().into_owned() }
}

#[no_mangle]
pub unsafe extern "C" fn cstr_free(s: *mut c_char) {
    if s.is_null() {
        return;
    }
    CString::from_raw(s);
}

#[no_mangle]
pub unsafe extern "C" fn c_set_logger(error: *mut u8) -> *const c_char {
    unwrap_to_c!(
        SimpleLogger::init(
            if cfg!(debug_assertions) {
                LevelFilter::Debug
            } else {
                LevelFilter::Info
            },
            Config::default()
        )
        .map(|_| "Logger initiated successfully!"),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_open_wallet(
    state_str: *const c_char,
    password: *const c_char,
    error: *mut u8,
) -> *mut Wallet {
    match open_wallet(
        &cstr_to_rust(state_str),
        ZeroingString::from(cstr_to_rust(password)),
    ) {
        Ok(wallet) => {
            *error = 0;
            Box::into_raw(Box::new(wallet))
        }
        Err(e) => {
            error!("Error opening wallet: {}", e);
            *error = 1;
            std::ptr::null_mut()
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn c_close_wallet(
    opened_wallet: *mut Wallet,
    error: *mut u8,
) -> *const c_char {
    if let Some(wallet) = opened_wallet.as_mut() {
        let result = close_wallet(&wallet);
        if result.is_ok() {
            Box::from_raw(wallet);
        };
        unwrap_to_c!(result, error)
    } else {
        *error = 1;
        CString::new("Can not close wallet".to_owned())
            .unwrap()
            .into_raw()
    }
}

#[no_mangle]
pub unsafe extern "C" fn c_seed_new(seed_length: u8, error: *mut u8) -> *const c_char {
    unwrap_to_c!(seed_new(seed_length as usize), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_init(
    state: *const c_char,
    phrase: *const c_char,
    password: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        wallet_init(
            &cstr_to_rust(state),
            &cstr_to_rust(phrase),
            &cstr_to_rust(password),
        ),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_scan_outputs(
    state: *const c_char,
    last_retrieved_index: u64,
    highest_index: u64,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        wallet_scan_outputs(&cstr_to_rust(state), last_retrieved_index, highest_index),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_pmmr_range(
    state: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(wallet_pmmr_range(&cstr_to_rust(state)), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_phrase(
    state_json: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(wallet_phrase(&cstr_to_rust(state_json)), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_get(
    state_json: *const c_char,
    refresh_from_node: bool,
    tx_slate_id: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_get(
            &cstr_to_rust(state_json),
            refresh_from_node,
            &cstr_to_rust(tx_slate_id),
        ),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_txs_get(
    state_json: *const c_char,
    refresh_from_node: bool,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(txs_get(&cstr_to_rust(state_json), refresh_from_node), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_strategies(
    state_json: *const c_char,
    amount: u64,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(tx_strategies(&cstr_to_rust(state_json), amount), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_create(
    state_json: *const c_char,
    amount: u64,
    selection_strategy_is_use_all: bool,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_create(
            &cstr_to_rust(state_json),
            amount,
            selection_strategy_is_use_all,
        ),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_cancel(
    state_json: *const c_char,
    id: u32,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(tx_cancel(&cstr_to_rust(state_json), id,), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_receive(
    state_json: *const c_char,
    slate_armored: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_receive(&cstr_to_rust(state_json), &cstr_to_rust(slate_armored),),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_finalize(
    state_json: *const c_char,
    slate_armored: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_finalize(&cstr_to_rust(state_json), &cstr_to_rust(slate_armored),),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_send_https(
    state_json: *const c_char,
    amount: u64,
    selection_strategy_is_use_all: bool,
    url: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_send_https(
            &cstr_to_rust(state_json),
            &cstr_to_rust(url),
            amount,
            selection_strategy_is_use_all,
        ),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_send_address(
    state_json: *const c_char,
    amount: u64,
    selection_strategy_is_use_all: bool,
    address: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_send_address(
            &cstr_to_rust(state_json),
            &cstr_to_rust(address),
            amount,
            selection_strategy_is_use_all,
        ),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_post(
    state_json: *const c_char,
    tx_slate_id: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_post(&cstr_to_rust(state_json), &cstr_to_rust(tx_slate_id)),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_slatepack_decode(
    state_json: *const c_char,
    slatepack: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        slatepack_decode(&cstr_to_rust(state_json), &cstr_to_rust(slatepack)),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_get_grin_address(
    state_json: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(get_grin_address(&cstr_to_rust(state_json)), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_start_listen_with_http(
    state_json: *const c_char,
    error: *mut u8,
) -> *mut ApiServer {
    let mut apis = ApiServer::new();
    let result = start_listen_with_http(&cstr_to_rust(state_json), &mut apis);
    *error = if result.is_err() { 1 } else { 0 };
    Box::into_raw(Box::new(apis))
}

#[no_mangle]
pub unsafe extern "C" fn c_stop_listen_with_http(
    api_server: *mut ApiServer,
    error: *mut u8,
) -> *const c_char {
    if let Some(apis) = api_server.as_mut() {
        apis.stop();
        Box::from_raw(api_server);
        *error = 0;
        CString::new("".to_owned()).unwrap().into_raw()
    } else {
        *error = 1;
        CString::new("Api server is NULL".to_owned())
            .unwrap()
            .into_raw()
    }
}

#[no_mangle]
pub unsafe extern "C" fn c_create_tor_config(
    wallet: *mut Wallet,
    listen_addr: *const c_char,
    error: *mut u8,
) -> *const c_char {
    if let Some(wallet) = wallet.as_mut() {
        unwrap_to_c!(
            create_tor_config(&*wallet, &cstr_to_rust(listen_addr)),
            error
        )
    } else {
        *error = 1;
        CString::new("Can not create TOR config, passed wallet is NULL".to_owned())
            .unwrap()
            .into_raw()
    }
}
