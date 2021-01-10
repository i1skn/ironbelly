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
use simplelog::{Config, LevelFilter, SimpleLogger};
use std::ffi::{CStr, CString};
use std::os::raw::c_char;

macro_rules! unwrap_string_to_c (
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

macro_rules! unwrap_to_c (
    ($func:expr, $error:expr) => (
        match $func {
            Ok(res) => {
                *$error = 0;
                Box::into_raw(Box::new(res)) as usize
            }
            Err(e) => {
                *$error = 1;
                CString::new(
                    serde_json::to_string(&format!("{}",e)).unwrap()).unwrap().into_raw() as usize
            }
        }
        ));

macro_rules! ensure_wallet (
    ($wallet_ptr:expr, $wallet:ident, $error:expr) => (
        if ($wallet_ptr as *mut Wallet).as_mut().is_none() {
            *$error = 1;
            return CString::new("Wallet is NULL".to_owned())
                .unwrap()
                .into_raw();
        }
        let $wallet = ($wallet_ptr as *mut Wallet).as_mut().unwrap();
    )
);

#[no_mangle]
pub unsafe extern "C" fn c_init_mainnet() {
    init(ChainTypes::Mainnet)
}

#[no_mangle]
pub unsafe extern "C" fn c_init_testnet() {
    init(ChainTypes::Testnet)
}

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
pub unsafe extern "C" fn c_set_logger() {
    SimpleLogger::init(
        if cfg!(debug_assertions) {
            LevelFilter::Debug
        } else {
            LevelFilter::Info
        },
        Config::default(),
    );
}

#[no_mangle]
pub unsafe extern "C" fn c_open_wallet(
    config_str: *const c_char,
    password: *const c_char,
    error: *mut u8,
) -> usize {
    unwrap_to_c!(
        open_wallet(&cstr_to_rust(config_str), &cstr_to_rust(password)),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_close_wallet(wallet_ptr: usize, error: *mut u8) -> *const c_char {
    ensure_wallet!(wallet_ptr, wallet, error);
    let result = close_wallet(&wallet);
    if result.is_ok() {
        Box::from_raw(wallet);
    };
    unwrap_string_to_c!(result, error)
}

#[no_mangle]
pub unsafe extern "C" fn c_seed_new(seed_length: u8, error: *mut u8) -> *const c_char {
    unwrap_string_to_c!(seed_new(seed_length as usize), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_init(
    config_str: *const c_char,
    phrase: *const c_char,
    password: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_string_to_c!(
        wallet_init(
            &cstr_to_rust(config_str),
            &cstr_to_rust(phrase),
            &cstr_to_rust(password),
        ),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_scan_outputs(
    wallet_ptr: usize,
    last_retrieved_index: u64,
    highest_index: u64,
    error: *mut u8,
) -> *const c_char {
    ensure_wallet!(wallet_ptr, wallet, error);
    unwrap_string_to_c!(
        wallet_scan_outputs(&wallet, last_retrieved_index, highest_index),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_pmmr_range(wallet_ptr: usize, error: *mut u8) -> *const c_char {
    ensure_wallet!(wallet_ptr, wallet, error);
    unwrap_string_to_c!(wallet_pmmr_range(&wallet), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_phrase(
    wallet_dir: *const c_char,
    password: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_string_to_c!(
        wallet_phrase(&cstr_to_rust(wallet_dir), &cstr_to_rust(password)),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_get(
    wallet_ptr: usize,
    refresh_from_node: bool,
    tx_slate_id: *const c_char,
    error: *mut u8,
) -> *const c_char {
    ensure_wallet!(wallet_ptr, wallet, error);
    unwrap_string_to_c!(
        tx_get(&wallet, refresh_from_node, &cstr_to_rust(tx_slate_id)),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_txs_get(
    wallet_ptr: usize,
    minimum_confirmations: u64,
    refresh_from_node: bool,
    error: *mut u8,
) -> *const c_char {
    ensure_wallet!(wallet_ptr, wallet, error);
    unwrap_string_to_c!(
        txs_get(&wallet, minimum_confirmations, refresh_from_node),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_strategies(
    wallet_ptr: usize,
    amount: u64,
    minimum_confirmations: u64,
    error: *mut u8,
) -> *const c_char {
    ensure_wallet!(wallet_ptr, wallet, error);
    unwrap_string_to_c!(tx_strategies(&wallet, amount, minimum_confirmations), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_create(
    wallet_ptr: usize,
    amount: u64,
    minimum_confirmations: u64,
    selection_strategy_is_use_all: bool,
    error: *mut u8,
) -> *const c_char {
    ensure_wallet!(wallet_ptr, wallet, error);
    unwrap_string_to_c!(
        tx_create(
            &wallet,
            amount,
            minimum_confirmations,
            selection_strategy_is_use_all
        ),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_cancel(wallet_ptr: usize, id: u32, error: *mut u8) -> *const c_char {
    ensure_wallet!(wallet_ptr, wallet, error);
    unwrap_string_to_c!(tx_cancel(&wallet, id), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_receive(
    wallet_ptr: usize,
    account: *const c_char,
    slate_armored: *const c_char,
    error: *mut u8,
) -> *const c_char {
    ensure_wallet!(wallet_ptr, wallet, error);
    unwrap_string_to_c!(
        tx_receive(
            &wallet,
            &cstr_to_rust(account),
            &cstr_to_rust(slate_armored),
        ),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_finalize(
    wallet_ptr: usize,
    slate_armored: *const c_char,
    error: *mut u8,
) -> *const c_char {
    ensure_wallet!(wallet_ptr, wallet, error);
    unwrap_string_to_c!(tx_finalize(&wallet, &cstr_to_rust(slate_armored)), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_send_address(
    wallet_ptr: usize,
    amount: u64,
    minimum_confirmations: u64,
    selection_strategy_is_use_all: bool,
    address: *const c_char,
    error: *mut u8,
) -> *const c_char {
    ensure_wallet!(wallet_ptr, wallet, error);
    unwrap_string_to_c!(
        tx_send_address(
            &wallet,
            &cstr_to_rust(address),
            amount,
            minimum_confirmations,
            selection_strategy_is_use_all,
        ),
        error
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_post(
    wallet_ptr: usize,
    tx_slate_id: *const c_char,
    error: *mut u8,
) -> *const c_char {
    ensure_wallet!(wallet_ptr, wallet, error);
    unwrap_string_to_c!(tx_post(wallet, &cstr_to_rust(tx_slate_id)), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_slatepack_decode(
    slatepack: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_string_to_c!(slatepack_decode(&cstr_to_rust(slatepack)), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_get_grin_address(wallet_ptr: usize, error: *mut u8) -> *const c_char {
    ensure_wallet!(wallet_ptr, wallet, error);
    unwrap_string_to_c!(get_grin_address(wallet), error)
}

#[no_mangle]
pub unsafe extern "C" fn c_start_listen_with_http(
    wallet_ptr: usize,
    api_listen_addr: *const c_char,
    error: *mut u8,
) -> usize {
    if (wallet_ptr as *mut Wallet).as_mut().is_none() {
        *error = 1;
        return CString::new("Wallet is null".to_owned())
            .unwrap()
            .into_raw() as usize;
    }
    let wallet = (wallet_ptr as *mut Wallet).as_mut().unwrap();
    let mut apis = ApiServer::new();
    let result = start_listen_with_http(&wallet, &cstr_to_rust(api_listen_addr), &mut apis);
    *error = if result.is_err() { 1 } else { 0 };
    Box::into_raw(Box::new(apis)) as usize
}

#[no_mangle]
pub unsafe extern "C" fn c_stop_listen_with_http(
    api_server: usize,
    error: *mut u8,
) -> *const c_char {
    if let Some(apis) = (api_server as *mut ApiServer).as_mut() {
        apis.stop();
        Box::from_raw(api_server as *mut ApiServer);
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
    wallet: usize,
    listen_addr: *const c_char,
    error: *mut u8,
) -> *const c_char {
    if let Some(wallet) = (wallet as *mut Wallet).as_mut() {
        unwrap_string_to_c!(
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
