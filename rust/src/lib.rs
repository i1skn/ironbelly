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
use libc::size_t;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

// Helper struct that we'll use to give strings to C.
#[repr(C)]
pub struct StringPtr {
    pub ptr: *const u8,
    pub len: size_t,
}

impl<'a> From<&'a str> for StringPtr {
    fn from(s: &'a str) -> Self {
        StringPtr {
            ptr: s.as_ptr(),
            len: s.len() as size_t,
        }
    }
}

impl StringPtr {
    pub fn as_str(&self) -> &str {
        use std::{slice, str};

        unsafe {
            let slice = slice::from_raw_parts(self.ptr, self.len);
            str::from_utf8(slice).unwrap()
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn rust_string_ptr(s: *mut String) -> *mut StringPtr {
    Box::into_raw(Box::new(StringPtr::from(&**s)))
}

#[no_mangle]
pub unsafe extern "C" fn rust_string_destroy(s: *mut String) {
    let _ = Box::from_raw(s);
}

#[no_mangle]
pub unsafe extern "C" fn rust_string_ptr_destroy(s: *mut StringPtr) {
    let _ = Box::from_raw(s);
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct RNError {
    pub code: u32,
    pub message: String,
}

impl From<String> for RNError {
    fn from(s: String) -> Self {
        RNError {
            code: 1,
            message: s,
        }
    }
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

macro_rules! unwrap_to_c (
	($func:expr, $error:expr) => (
	match $func {
        Ok(res) => {
            *$error = 0;
            Box::into_raw(Box::new(res.to_owned()))
        }
        Err(e) => {
            *$error = 1;
            Box::into_raw(Box::new(
                serde_json::to_string(&RNError::from(format!("{}", e))).unwrap(),
            ))
        }
    }
));

#[no_mangle]
pub unsafe extern "C" fn c_wallet_init(
    path: *mut StringPtr,
    password: *mut StringPtr,
    check_node_api_http_addr: *mut StringPtr,
    error: *mut u8,
) -> *mut String {
    unwrap_to_c!(
        wallet_init(
            (*path).as_str(),
            (*password).as_str(),
            (*check_node_api_http_addr).as_str(),
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
    path: *mut StringPtr,
    phrase: *mut StringPtr,
    password: *mut StringPtr,
    check_node_api_http_addr: *mut StringPtr,
    error: *mut u8,
) -> *mut String {
    unwrap_to_c!(
        wallet_recovery(
            (*path).as_str(),
            (*phrase).as_str(),
            (*password).as_str(),
            (*check_node_api_http_addr).as_str(),
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
    path: *mut StringPtr,
    password: *mut StringPtr,
    check_node_api_http_addr: *mut StringPtr,
    error: *mut u8,
) -> *mut String {
    unwrap_to_c!(
        wallet_phrase(
            (*path).as_str(),
            (*password).as_str(),
            (*check_node_api_http_addr).as_str(),
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
    path: *mut StringPtr,
    account: *mut StringPtr,
    password: *mut StringPtr,
    check_node_api_http_addr: *mut StringPtr,
    refresh_from_node: bool,
    tx_id: u32,
    error: *mut u8,
) -> *mut String {
    unwrap_to_c!(
        tx_get(
            (*path).as_str(),
            (*account).as_str(),
            (*password).as_str(),
            (*check_node_api_http_addr).as_str(),
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
    path: *mut StringPtr,
    account: *mut StringPtr,
    password: *mut StringPtr,
    check_node_api_http_addr: *mut StringPtr,
    refresh_from_node: bool,
    error: *mut u8,
) -> *mut String {
    unwrap_to_c!(
        txs_get(
            (*path).as_str(),
            (*account).as_str(),
            (*password).as_str(),
            (*check_node_api_http_addr).as_str(),
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
    path: *mut StringPtr,
    account: *mut StringPtr,
    password: *mut StringPtr,
    check_node_api_http_addr: *mut StringPtr,
    refresh_from_node: bool,
    error: *mut u8,
) -> *mut String {
    unwrap_to_c!(
        balance(
            (*path).as_str(),
            (*account).as_str(),
            (*password).as_str(),
            (*check_node_api_http_addr).as_str(),
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
    if let Ok(smallest) = api.estimate_initiate_tx(None, amount, 1, 500, 1, false) {
        result.push(Strategy {
            selection_strategy_is_use_all: false,
            total: smallest.0,
            fee: smallest.1,
        })
    }
    match api.estimate_initiate_tx(None, amount, 1, 500, 1, true) {
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
    path: *mut StringPtr,
    account: *mut StringPtr,
    password: *mut StringPtr,
    check_node_api_http_addr: *mut StringPtr,
    amount: u64,
    error: *mut u8,
) -> *mut String {
    unwrap_to_c!(
        tx_strategies(
            (*path).as_str(),
            (*account).as_str(),
            (*password).as_str(),
            (*check_node_api_http_addr).as_str(),
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
        500,
        1,
        selection_strategy_is_use_all,
        Some(message.to_owned()),
    )?;
    api.tx_lock_outputs(&slate, lock_fn)?;
    Ok(serde_json::to_string(&slate).unwrap())
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_create(
    path: *mut StringPtr,
    account: *mut StringPtr,
    password: *mut StringPtr,
    check_node_api_http_addr: *mut StringPtr,
    amount: u64,
    selection_strategy_is_use_all: bool,
    message: *mut StringPtr,
    error: *mut u8,
) -> *mut String {
    unwrap_to_c!(
        tx_create(
            (*path).as_str(),
            (*account).as_str(),
            (*password).as_str(),
            (*check_node_api_http_addr).as_str(),
            (*message).as_str(),
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
    path: *mut StringPtr,
    account: *mut StringPtr,
    password: *mut StringPtr,
    check_node_api_http_addr: *mut StringPtr,
    id: u32,
    error: *mut u8,
) -> *mut String {
    unwrap_to_c!(
        tx_cancel(
            (*path).as_str(),
            (*account).as_str(),
            (*password).as_str(),
            (*check_node_api_http_addr).as_str(),
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
    path: *mut StringPtr,
    account: *mut StringPtr,
    password: *mut StringPtr,
    check_node_api_http_addr: *mut StringPtr,
    slate_path: *mut StringPtr,
    message: *mut StringPtr,
    error: *mut u8,
) -> *mut String {
    unwrap_to_c!(
        tx_receive(
            (*path).as_str(),
            (*account).as_str(),
            (*password).as_str(),
            (*check_node_api_http_addr).as_str(),
            (*slate_path).as_str(),
            (*message).as_str(),
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
    path: *mut StringPtr,
    account: *mut StringPtr,
    password: *mut StringPtr,
    check_node_api_http_addr: *mut StringPtr,
    slate_path: *mut StringPtr,
    error: *mut u8,
) -> *mut String {
    unwrap_to_c!(
        tx_finalize(
            (*path).as_str(),
            (*account).as_str(),
            (*password).as_str(),
            (*check_node_api_http_addr).as_str(),
            (*slate_path).as_str(),
        ),
        error
    )
}
