// Copyright 2019 Ivan Sorokin.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use grin_core::global::ChainTypes;
use grin_keychain::ExtKeychain;
use grin_util::file::get_first_line;
use grin_util::Mutex;
use grin_wallet::libwallet::api::{APIForeign, APIOwner};
use grin_wallet::libwallet::types::{NodeClient, WalletInst};
use grin_wallet::{
    instantiate_wallet, FileWalletCommAdapter, HTTPNodeClient, LMDBBackend, WalletConfig,
    WalletSeed,
};
use serde::{Deserialize, Serialize};
use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::sync::Arc;

fn c_str_to_rust(s: *const c_char) -> String {
    unsafe { CStr::from_ptr(s).to_string_lossy().into_owned() }
}

#[no_mangle]
pub unsafe extern "C" fn cstr_free(s: *mut c_char) {
    if s.is_null() {
        return;
    }
    CString::from_raw(s);
}

pub fn get_wallet_config(wallet_dir: &str, check_node_api_http_addr: &str) -> WalletConfig {
    WalletConfig {
        chain_type: Some(ChainTypes::Floonet),
        api_listen_interface: "127.0.0.1".to_string(),
        api_listen_port: 13415,
        api_secret_path: Some(".api_secret".to_string()),
        node_api_secret_path: Some(wallet_dir.to_owned() + "/.api_secret"),
        check_node_api_http_addr: check_node_api_http_addr.to_string(),
        data_file_dir: wallet_dir.to_owned() + "/wallet_data",
        tls_certificate_file: None,
        tls_certificate_key: None,
        dark_background_color_scheme: Some(true),
        keybase_notify_ttl: Some(1),
        no_commit_cache: None,
        owner_api_include_foreign: None,
        owner_api_listen_port: Some(WalletConfig::default_owner_api_listen_port()),
    }
}

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

fn check_password(path: &str, password: &str) -> Result<String, grin_wallet::Error> {
    let wallet_config = get_wallet_config(path, "");
    match WalletSeed::from_file(&wallet_config, &password) {
        Ok(_) => Ok("".to_owned()),
        Err(e) => Err(grin_wallet::Error::from(e)),
    }
}

#[no_mangle]
pub unsafe extern "C" fn c_check_password(
    path: *const c_char,
    password: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        check_password(&c_str_to_rust(path), &c_str_to_rust(password),),
        error
    )
}

fn wallet_init(
    path: &str,
    password: &str,
    check_node_api_http_addr: &str,
) -> Result<String, grin_wallet::Error> {
    let wallet_config = get_wallet_config(path, check_node_api_http_addr);
    let node_api_secret = get_first_line(wallet_config.node_api_secret_path.clone());
    let seed = WalletSeed::init_file(&wallet_config, 16, None, &password)?;
    let client_n = HTTPNodeClient::new(
        &wallet_config.check_node_api_http_addr,
        node_api_secret.clone(),
    );
    let _: LMDBBackend<HTTPNodeClient, ExtKeychain> =
        LMDBBackend::new(wallet_config.clone(), &password, client_n)?;
    seed.to_mnemonic()
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_init(
    path: *const c_char,
    password: *const c_char,
    check_node_api_http_addr: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        wallet_init(
            &c_str_to_rust(path),
            &c_str_to_rust(password),
            &c_str_to_rust(check_node_api_http_addr),
        ),
        error
    )
}

fn wallet_recovery(
    path: &str,
    phrase: &str,
    password: &str,
    check_node_api_http_addr: &str,
) -> Result<String, grin_wallet::Error> {
    let wallet_config = get_wallet_config(path, check_node_api_http_addr);
    let node_api_secret = get_first_line(wallet_config.node_api_secret_path.clone());
    let _res = WalletSeed::recover_from_phrase(&wallet_config, &phrase, &password)?;
    let node_client = HTTPNodeClient::new(&wallet_config.check_node_api_http_addr, node_api_secret);
    let wallet = instantiate_wallet(wallet_config.clone(), node_client, password, "default")?;
    let mut api = APIOwner::new(wallet.clone());
    match api.restore() {
        Ok(_) => Ok("".to_owned()),
        Err(e) => Err(grin_wallet::Error::from(e)),
    }
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_recovery(
    path: *const c_char,
    phrase: *const c_char,
    password: *const c_char,
    check_node_api_http_addr: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        wallet_recovery(
            &c_str_to_rust(path),
            &c_str_to_rust(phrase),
            &c_str_to_rust(password),
            &c_str_to_rust(check_node_api_http_addr),
        ),
        error
    )
}

fn wallet_phrase(
    path: &str,
    password: &str,
    check_node_api_http_addr: &str,
) -> Result<String, grin_wallet::Error> {
    let wallet_config = get_wallet_config(path, check_node_api_http_addr);
    let seed = WalletSeed::from_file(&wallet_config, &password)?;
    seed.to_mnemonic()
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_phrase(
    path: *const c_char,
    password: *const c_char,
    check_node_api_http_addr: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        wallet_phrase(
            &c_str_to_rust(path),
            &c_str_to_rust(password),
            &c_str_to_rust(check_node_api_http_addr),
        ),
        error
    )
}

fn get_wallet(
    path: &str,
    account: &str,
    password: &str,
    check_node_api_http_addr: &str,
) -> Result<Arc<Mutex<WalletInst<impl NodeClient, ExtKeychain>>>, grin_wallet::Error> {
    let wallet_config = get_wallet_config(path, check_node_api_http_addr);
    let node_api_secret = get_first_line(wallet_config.node_api_secret_path.clone());

    let node_client = HTTPNodeClient::new(&wallet_config.check_node_api_http_addr, node_api_secret);
    instantiate_wallet(wallet_config.clone(), node_client, password, account)
}

fn tx_get(
    path: &str,
    account: &str,
    password: &str,
    check_node_api_http_addr: &str,
    refresh_from_node: bool,
    tx_id: u32,
) -> Result<String, grin_wallet::Error> {
    let wallet = get_wallet(path, account, password, check_node_api_http_addr)?;
    let api = APIOwner::new(wallet.clone());
    let txs = api.retrieve_txs(refresh_from_node, Some(tx_id), None)?;
    Ok(serde_json::to_string(&txs).unwrap())
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_get(
    path: *const c_char,
    account: *const c_char,
    password: *const c_char,
    check_node_api_http_addr: *const c_char,
    refresh_from_node: bool,
    tx_id: u32,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_get(
            &c_str_to_rust(path),
            &c_str_to_rust(account),
            &c_str_to_rust(password),
            &c_str_to_rust(check_node_api_http_addr),
            refresh_from_node,
            tx_id,
        ),
        error
    )
}

fn txs_get(
    path: &str,
    account: &str,
    password: &str,
    check_node_api_http_addr: &str,
    refresh_from_node: bool,
) -> Result<String, grin_wallet::Error> {
    let wallet = get_wallet(path, account, password, check_node_api_http_addr)?;
    let api = APIOwner::new(wallet.clone());

    match api.retrieve_txs(refresh_from_node, None, None) {
        Ok(txs) => Ok(serde_json::to_string(&txs).unwrap()),
        Err(e) => Err(grin_wallet::Error::from(e)),
    }
}

#[no_mangle]
pub unsafe extern "C" fn c_txs_get(
    path: *const c_char,
    account: *const c_char,
    password: *const c_char,
    check_node_api_http_addr: *const c_char,
    refresh_from_node: bool,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        txs_get(
            &c_str_to_rust(path),
            &c_str_to_rust(account),
            &c_str_to_rust(password),
            &c_str_to_rust(check_node_api_http_addr),
            refresh_from_node,
        ),
        error
    )
}

fn balance(
    path: &str,
    account: &str,
    password: &str,
    check_node_api_http_addr: &str,
    refresh_from_node: bool,
) -> Result<String, grin_wallet::Error> {
    let wallet = get_wallet(path, account, password, check_node_api_http_addr)?;
    let mut api = APIOwner::new(wallet.clone());
    let (_validated, wallet_info) = api.retrieve_summary_info(refresh_from_node, 1)?;
    Ok(serde_json::to_string(&wallet_info).unwrap())
}

#[no_mangle]
pub unsafe extern "C" fn c_balance(
    path: *const c_char,
    account: *const c_char,
    password: *const c_char,
    check_node_api_http_addr: *const c_char,
    refresh_from_node: bool,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        balance(
            &c_str_to_rust(path),
            &c_str_to_rust(account),
            &c_str_to_rust(password),
            &c_str_to_rust(check_node_api_http_addr),
            refresh_from_node,
        ),
        error
    )
}

#[derive(Serialize, Deserialize)]
struct Strategy {
    selection_strategy_is_use_all: bool,
    total: u64,
    fee: u64,
}

fn tx_strategies(
    path: &str,
    account: &str,
    password: &str,
    check_node_api_http_addr: &str,
    amount: u64,
) -> Result<String, grin_wallet::Error> {
    let wallet = get_wallet(path, account, password, check_node_api_http_addr)?;
    let mut api = APIOwner::new(wallet.clone());
    let mut result = vec![];
    if let Ok(smallest) = api.estimate_initiate_tx(None, amount, 1, 1, false) {
        result.push(Strategy {
            selection_strategy_is_use_all: false,
            total: smallest.0,
            fee: smallest.1,
        })
    }
    match api.estimate_initiate_tx(None, amount, 1, 1, true) {
        Ok(all) => {
            result.push(Strategy {
                selection_strategy_is_use_all: true,
                total: all.0,
                fee: all.1,
            });
            Ok(serde_json::to_string(&result).unwrap())
        }
        Err(e) => Err(grin_wallet::Error::from(e)),
    }
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_strategies(
    path: *const c_char,
    account: *const c_char,
    password: *const c_char,
    check_node_api_http_addr: *const c_char,
    amount: u64,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_strategies(
            &c_str_to_rust(path),
            &c_str_to_rust(account),
            &c_str_to_rust(password),
            &c_str_to_rust(check_node_api_http_addr),
            amount,
        ),
        error
    )
}

fn tx_create(
    path: &str,
    account: &str,
    password: &str,
    check_node_api_http_addr: &str,
    message: &str,
    amount: u64,
    selection_strategy_is_use_all: bool,
) -> Result<String, grin_wallet::Error> {
    let wallet = get_wallet(path, account, password, check_node_api_http_addr)?;
    let mut api = APIOwner::new(wallet.clone());
    let (slate, lock_fn) = api.initiate_tx(
        None,
        amount,
        1,
        1,
        selection_strategy_is_use_all,
        Some(message.to_owned()),
    )?;
    api.tx_lock_outputs(&slate, lock_fn)?;
    Ok(serde_json::to_string(&slate).unwrap())
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_create(
    path: *const c_char,
    account: *const c_char,
    password: *const c_char,
    check_node_api_http_addr: *const c_char,
    amount: u64,
    selection_strategy_is_use_all: bool,
    message: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_create(
            &c_str_to_rust(path),
            &c_str_to_rust(account),
            &c_str_to_rust(password),
            &c_str_to_rust(check_node_api_http_addr),
            &c_str_to_rust(message),
            amount,
            selection_strategy_is_use_all,
        ),
        error
    )
}

fn tx_cancel(
    path: &str,
    account: &str,
    password: &str,
    check_node_api_http_addr: &str,
    id: u32,
) -> Result<String, grin_wallet::Error> {
    let wallet = get_wallet(path, account, password, check_node_api_http_addr)?;
    let mut api = APIOwner::new(wallet.clone());
    api.cancel_tx(Some(id), None)?;
    Ok("".to_owned())
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_cancel(
    path: *const c_char,
    account: *const c_char,
    password: *const c_char,
    check_node_api_http_addr: *const c_char,
    id: u32,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_cancel(
            &c_str_to_rust(path),
            &c_str_to_rust(account),
            &c_str_to_rust(password),
            &c_str_to_rust(check_node_api_http_addr),
            id,
        ),
        error
    )
}

fn tx_receive(
    path: &str,
    account: &str,
    password: &str,
    check_node_api_http_addr: &str,
    slate_path: &str,
    message: &str,
) -> Result<String, grin_wallet::Error> {
    let wallet = get_wallet(path, account, password, check_node_api_http_addr)?;
    let mut api = APIForeign::new(wallet.clone());
    let adapter = FileWalletCommAdapter::new();
    let mut slate = adapter.receive_tx_async(&slate_path)?;
    api.verify_slate_messages(&slate)?;
    api.receive_tx(&mut slate, Some(account), Some(message.to_owned()))?;
    Ok(serde_json::to_string(&slate).unwrap())
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_receive(
    path: *const c_char,
    account: *const c_char,
    password: *const c_char,
    check_node_api_http_addr: *const c_char,
    slate_path: *const c_char,
    message: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_receive(
            &c_str_to_rust(path),
            &c_str_to_rust(account),
            &c_str_to_rust(password),
            &c_str_to_rust(check_node_api_http_addr),
            &c_str_to_rust(slate_path),
            &c_str_to_rust(message),
        ),
        error
    )
}

fn tx_finalize(
    path: &str,
    account: &str,
    password: &str,
    check_node_api_http_addr: &str,
    slate_path: &str,
) -> Result<String, grin_wallet::Error> {
    let wallet = get_wallet(path, account, password, check_node_api_http_addr)?;
    let mut api = APIOwner::new(wallet.clone());
    let adapter = FileWalletCommAdapter::new();
    let mut slate = adapter.receive_tx_async(&slate_path)?;
    api.verify_slate_messages(&slate)?;
    api.finalize_tx(&mut slate)?;
    api.post_tx(&slate.tx, true)?;
    Ok("".to_owned())
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_finalize(
    path: *const c_char,
    account: *const c_char,
    password: *const c_char,
    check_node_api_http_addr: *const c_char,
    slate_path: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_finalize(
            &c_str_to_rust(path),
            &c_str_to_rust(account),
            &c_str_to_rust(password),
            &c_str_to_rust(check_node_api_http_addr),
            &c_str_to_rust(slate_path),
        ),
        error
    )
}
