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

use grin_wallet_libwallet::{
    slate_versions, wallet_lock, InitTxArgs, NodeClient, WalletInst, WalletLCProvider,
};
use grin_wallet_util::grin_core::global::ChainTypes;
use grin_wallet_util::grin_keychain::{ExtKeychain, Keychain};
use grin_wallet_util::grin_util::file::get_first_line;
use grin_wallet_util::grin_util::Mutex;
use grin_wallet_util::grin_util::ZeroingString;

use grin_wallet_config::{WalletConfig, GRIN_WALLET_DIR};
use grin_wallet_impls::{
    DefaultLCProvider, DefaultWalletImpl, Error, ErrorKind, HTTPNodeClient, HttpSlateSender,
    PathToSlate, SlateGetter, SlateSender, WalletSeed,
};

use grin_wallet_api::{Foreign, Owner};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::sync::Arc;
use uuid::Uuid;

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

#[derive(Serialize, Deserialize, Clone)]
struct State {
    wallet_dir: String,
    check_node_api_http_addr: String,
    chain: String,
    minimum_confirmations: u64,
    account: Option<String>,
    password: String,
}

impl State {
    fn from_str(json: &str) -> Result<Self, Error> {
        serde_json::from_str::<State>(json)
            .map_err(|e| Error::from(ErrorKind::GenericError(e.to_string())))
    }
}

fn create_wallet_config(state: State) -> Result<WalletConfig, Error> {
    let chain_type = match state.chain.as_ref() {
        "mainnet" => ChainTypes::Mainnet,
        "floonet" => ChainTypes::Floonet,
        "usertesting" => ChainTypes::UserTesting,
        "automatedtesting" => ChainTypes::AutomatedTesting,
        _ => ChainTypes::Floonet,
    };

    Ok(WalletConfig {
        chain_type: Some(chain_type),
        api_listen_interface: "127.0.0.1".to_string(),
        api_listen_port: 13415,
        api_secret_path: Some(".api_secret".to_string()),
        node_api_secret_path: Some(state.wallet_dir.clone() + "/.api_secret"),
        check_node_api_http_addr: state.check_node_api_http_addr,
        data_file_dir: state.wallet_dir,
        tls_certificate_file: None,
        tls_certificate_key: None,
        dark_background_color_scheme: Some(true),
        keybase_notify_ttl: Some(1),
        no_commit_cache: None,
        owner_api_include_foreign: None,
        owner_api_listen_port: Some(WalletConfig::default_owner_api_listen_port()),
    })
}

fn get_wallet(
    state: State,
) -> Result<
    Arc<
        Mutex<
            Box<
                dyn WalletInst<
                    'static,
                    DefaultLCProvider<'static, HTTPNodeClient, ExtKeychain>,
                    HTTPNodeClient,
                    ExtKeychain,
                >,
            >,
        >,
    >,
    Error,
> {
    let wallet_config = create_wallet_config(state.clone())?;
    let node_api_secret = get_first_line(wallet_config.node_api_secret_path.clone());

    let node_client = HTTPNodeClient::new(&wallet_config.check_node_api_http_addr, node_api_secret);
    let wallet = inst_wallet::<
        DefaultLCProvider<HTTPNodeClient, ExtKeychain>,
        HTTPNodeClient,
        ExtKeychain,
    >(wallet_config.clone(), node_client)?;
    // .unwrap_or_else(|e| {
    // println!("{}", e);
    // std::process::exit(1);
    // });

    {
        let mut wallet_lock = wallet.lock();
        let lc = wallet_lock.lc_provider()?;
        if let Ok(open_wallet) = lc.wallet_exists(None) {
            if open_wallet {
                lc.open_wallet(None, ZeroingString::from(state.password), false, false)?;
                if let Some(account) = state.account {
                    let wallet_inst = lc.wallet_inst()?;
                    wallet_inst.set_parent_key_id_by_name(&account)?;
                }
            }
        }
    }

    return Ok(wallet);
}

fn inst_wallet<L, C, K>(
    config: WalletConfig,
    node_client: C,
) -> Result<Arc<Mutex<Box<dyn WalletInst<'static, L, C, K>>>>, Error>
where
    DefaultWalletImpl<'static, C>: WalletInst<'static, L, C, K>,
    L: WalletLCProvider<'static, C, K>,
    C: NodeClient + 'static,
    K: Keychain + 'static,
{
    let mut wallet = Box::new(DefaultWalletImpl::<'static, C>::new(node_client.clone())?)
        as Box<dyn WalletInst<'static, L, C, K>>;
    let lc = wallet.lc_provider()?;
    lc.set_top_level_directory(&config.data_file_dir)?;
    Ok(Arc::new(Mutex::new(wallet)))
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

macro_rules! unwrap_to_c_with_e2e (
    ($e2e_func:expr, $func:expr, $error:expr) => (
        match if option_env!("E2E_TEST").is_some() { $e2e_func } else { $func } {
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

fn check_password(state_json: &str, password: ZeroingString) -> Result<String, Error> {
    let wallet_config = create_wallet_config(State::from_str(state_json)?)?;
    WalletSeed::from_file(
        &format!("{}/{}", &wallet_config.data_file_dir, GRIN_WALLET_DIR),
        password,
    )
    .map_err(|e| Error::from(e))?;
    Ok("".to_owned())
}

#[no_mangle]
pub unsafe extern "C" fn c_check_password(
    state_str: *const c_char,
    password: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        check_password(
            &c_str_to_rust(state_str),
            ZeroingString::from(c_str_to_rust(password))
        ),
        error
    )
}

fn seed_new(seed_length: usize) -> Result<String, Error> {
    WalletSeed::init_new(seed_length).to_mnemonic()
}

fn e2e_seed_new() -> Result<String, Error> {
    Ok("confirm erupt mirror palace hockey final admit announce minimum apple work slam return jeans lobster chalk fatal sense prison water host fat eagle seed".to_owned())
}

#[no_mangle]
pub unsafe extern "C" fn c_seed_new(seed_length: u8, error: *mut u8) -> *const c_char {
    unwrap_to_c_with_e2e!(e2e_seed_new(), seed_new(seed_length as usize), error)
}

fn wallet_init(state_json: &str, phrase: &str, password: &str) -> Result<String, Error> {
    let wallet = get_wallet(State::from_str(state_json)?)?;
    let mut wallet_lock = wallet.lock();
    let lc = wallet_lock.lc_provider()?;
    lc.create_wallet(
        None,
        Some(ZeroingString::from(phrase)),
        32,
        ZeroingString::from(password),
        false,
    )?;
    Ok("".to_owned())
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
            &c_str_to_rust(state),
            &c_str_to_rust(phrase),
            &c_str_to_rust(password),
        ),
        error
    )
}

fn wallet_scan(state_json: &str, start_height: u64, limit: u64) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state)?;
    let api = Owner::new(wallet.clone());
    api.scan(
        None,
        Some(start_height),
        Some(start_height + limit - 1),
        true,
    )?;
    wallet_lock!(wallet, w);
    let last_scanned_block = w.last_scanned_block()?;
    let tip = w.w2n_client().get_chain_tip()?;
    let result = json!({
    "lastRetrievedIndex": last_scanned_block.height,
    "highestIndex": tip.0,
    "downloadedInBytes" : 0,
    })
    .to_string();
    // let result = json!({
    // "lastRetrievedIndex": 1,
    // "highestIndex": 1,
    // "downloadedInBytes" : 0,
    // })
    // .to_string();
    Ok(result)
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_scan(
    state: *const c_char,
    start_height: u64,
    limit: u64,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        wallet_scan(&c_str_to_rust(state), start_height, limit),
        error
    )
}

fn wallet_phrase(state_json: &str) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let seed = WalletSeed::from_file(
        &format!("{}/{}", &state.wallet_dir, GRIN_WALLET_DIR),
        ZeroingString::from(state.password),
    )?;
    seed.to_mnemonic()
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_phrase(
    state_json: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(wallet_phrase(&c_str_to_rust(state_json)), error)
}

fn tx_get(state_json: &str, refresh_from_node: bool, tx_slate_id: &str) -> Result<String, Error> {
    let wallet = get_wallet(State::from_str(state_json)?)?;
    let api = Owner::new(wallet.clone());
    let uuid = Uuid::parse_str(tx_slate_id).map_err(|e| ErrorKind::GenericError(e.to_string()))?;
    let txs = api.retrieve_txs(None, refresh_from_node, None, Some(uuid))?;
    Ok(serde_json::to_string(&txs).unwrap())
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
            &c_str_to_rust(state_json),
            refresh_from_node,
            &c_str_to_rust(tx_slate_id),
        ),
        error
    )
}

fn txs_get(state_json: &str, refresh_from_node: bool) -> Result<String, Error> {
    let wallet = get_wallet(State::from_str(state_json)?)?;
    let api = Owner::new(wallet.clone());

    match api.retrieve_txs(None, refresh_from_node, None, None) {
        Ok(txs) => Ok(serde_json::to_string(&txs).unwrap()),
        Err(e) => Err(Error::from(e)),
    }
}

#[no_mangle]
pub unsafe extern "C" fn c_txs_get(
    state_json: *const c_char,
    refresh_from_node: bool,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        txs_get(&c_str_to_rust(state_json), refresh_from_node),
        error
    )
}

fn balance(state_json: &str, refresh_from_node: bool) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;
    // let api = Owner::new(wallet.clone());
    // let (_validated, wallet_info) =
    // api.retrieve_summary_info(None, refresh_from_node, state.minimum_confirmations)?;
    // Ok(serde_json::to_string(&wallet_info).unwrap())
    Ok("her".to_owned())
}

#[no_mangle]
pub unsafe extern "C" fn c_balance(
    state_json: *const c_char,
    refresh_from_node: bool,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        balance(&c_str_to_rust(state_json), refresh_from_node,),
        error
    )
}

#[derive(Serialize, Deserialize)]
struct Strategy {
    selection_strategy_is_use_all: bool,
    total: u64,
    fee: u64,
}

fn tx_strategies(state_json: &str, amount: u64) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;
    let api = Owner::new(wallet.clone());
    let mut result = vec![];
    let mut args = InitTxArgs {
        src_acct_name: None,
        amount,
        minimum_confirmations: state.minimum_confirmations,
        max_outputs: 500,
        num_change_outputs: 1,
        selection_strategy_is_use_all: false,
        message: None,
        target_slate_version: None,
        estimate_only: Some(true),
        send_args: None,
        payment_proof_recipient_address: None,
        ttl_blocks: None,
    };
    if let Ok(smallest) = api.init_send_tx(None, args.clone()) {
        result.push(Strategy {
            selection_strategy_is_use_all: false,
            total: smallest.amount,
            fee: smallest.fee,
        })
    }
    args.selection_strategy_is_use_all = true;
    let all = api.init_send_tx(None, args).map_err(|e| Error::from(e))?;
    result.push(Strategy {
        selection_strategy_is_use_all: true,
        total: all.amount,
        fee: all.fee,
    });
    Ok(serde_json::to_string(&result).unwrap())
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_strategies(
    state_json: *const c_char,
    amount: u64,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(tx_strategies(&c_str_to_rust(state_json), amount), error)
}

fn tx_create(
    state_json: &str,
    message: &str,
    amount: u64,
    selection_strategy_is_use_all: bool,
) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;
    let api = Owner::new(wallet.clone());
    let args = InitTxArgs {
        src_acct_name: None,
        amount,
        minimum_confirmations: state.minimum_confirmations,
        max_outputs: 500,
        num_change_outputs: 1,
        selection_strategy_is_use_all,
        message: Some(message.to_owned()),
        target_slate_version: None,
        estimate_only: Some(false),
        send_args: None,
        payment_proof_recipient_address: None,
        ttl_blocks: None,
    };
    let slate = api.init_send_tx(None, args).unwrap();
    api.tx_lock_outputs(None, &slate, 0)?;
    Ok(
        serde_json::to_string(&slate_versions::VersionedSlate::into_version(
            slate.clone(),
            slate_versions::SlateVersion::V2,
        ))
        .map_err(|e| ErrorKind::GenericError(e.to_string()))?,
    )
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_create(
    state_json: *const c_char,
    amount: u64,
    selection_strategy_is_use_all: bool,
    message: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_create(
            &c_str_to_rust(state_json),
            &c_str_to_rust(message),
            amount,
            selection_strategy_is_use_all,
        ),
        error
    )
}

fn tx_cancel(state_json: &str, id: u32) -> Result<String, Error> {
    let wallet = get_wallet(State::from_str(state_json)?)?;
    let api = Owner::new(wallet.clone());
    api.cancel_tx(None, Some(id), None)?;
    Ok("".to_owned())
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_cancel(
    state_json: *const c_char,
    id: u32,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(tx_cancel(&c_str_to_rust(state_json), id,), error)
}

fn tx_receive(state_json: &str, slate_path: &str, message: &str) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;
    let api = Foreign::new(wallet.clone(), None, None);
    let mut slate = PathToSlate((&slate_path).into()).get_tx()?;
    api.verify_slate_messages(&slate)?;
    if let Some(account) = state.account {
        slate = api.receive_tx(&slate, Some(&account), Some(message.to_owned()))?;
        Ok(serde_json::to_string(&slate).map_err(|e| ErrorKind::GenericError(e.to_string()))?)
    } else {
        Err(Error::from(ErrorKind::GenericError(
            "Account is not specified".to_owned(),
        )))
    }
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_receive(
    state_json: *const c_char,
    slate_path: *const c_char,
    message: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_receive(
            &c_str_to_rust(state_json),
            &c_str_to_rust(slate_path),
            &c_str_to_rust(message),
        ),
        error
    )
}

fn tx_finalize(state_json: &str, slate_path: &str) -> Result<String, Error> {
    let wallet = get_wallet(State::from_str(state_json)?)?;
    let api = Owner::new(wallet.clone());
    let mut slate = PathToSlate((&slate_path).into()).get_tx()?;
    api.verify_slate_messages(None, &slate)?;
    slate = api.finalize_tx(None, &slate)?;
    Ok(serde_json::to_string(&slate).map_err(|e| ErrorKind::GenericError(e.to_string()))?)
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_finalize(
    state_json: *const c_char,
    slate_path: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_finalize(&c_str_to_rust(state_json), &c_str_to_rust(slate_path),),
        error
    )
}

fn tx_send_https(
    state_json: &str,
    message: &str,
    url: &str,
    amount: u64,
    selection_strategy_is_use_all: bool,
) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;
    let api = Owner::new(wallet.clone());
    let args = InitTxArgs {
        src_acct_name: None,
        amount,
        minimum_confirmations: state.minimum_confirmations,
        max_outputs: 500,
        num_change_outputs: 1,
        selection_strategy_is_use_all,
        message: Some(message.to_owned()),
        target_slate_version: None,
        estimate_only: Some(false),
        send_args: None,
        payment_proof_recipient_address: None,
        ttl_blocks: None,
    };
    let slate = api.init_send_tx(None, args)?;
    let sender = Box::new(
        HttpSlateSender::new(url)
            .map_err(|_| ErrorKind::GenericError(format!("Invalid destination URL: {}", url)))?,
    );
    api.tx_lock_outputs(None, &slate, 0)?;
    match sender.send_tx(&slate) {
        Ok(mut slate) => {
            api.verify_slate_messages(None, &slate)?;
            api.finalize_tx(None, &mut slate)?;
            Ok(
                serde_json::to_string(&slate_versions::VersionedSlate::into_version(
                    slate.clone(),
                    slate_versions::SlateVersion::V2,
                ))
                .map_err(|e| ErrorKind::GenericError(e.to_string()))?,
            )
        }
        Err(e) => {
            api.cancel_tx(None, None, Some(slate.id))?;
            Err(Error::from(e))
        }
    }
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_send_https(
    state_json: *const c_char,
    amount: u64,
    selection_strategy_is_use_all: bool,
    message: *const c_char,
    url: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_send_https(
            &c_str_to_rust(state_json),
            &c_str_to_rust(message),
            &c_str_to_rust(url),
            amount,
            selection_strategy_is_use_all,
        ),
        error
    )
}

fn tx_post(state_json: &str, tx_slate_id: &str) -> Result<String, Error> {
    let wallet = get_wallet(State::from_str(state_json)?)?;
    let api = Owner::new(wallet.clone());
    let uuid = Uuid::parse_str(tx_slate_id).map_err(|e| ErrorKind::GenericError(e.to_string()))?;
    let (_, txs) = api.retrieve_txs(None, true, None, Some(uuid))?;
    if txs[0].confirmed {
        return Err(Error::from(ErrorKind::GenericError(format!(
            "Transaction with id {} is already confirmed. Not posting.",
            tx_slate_id
        ))));
    }
    let stored_tx = api.get_stored_tx(None, &txs[0])?;
    match stored_tx {
        Some(stored_tx) => {
            api.post_tx(None, &stored_tx, true)?;
            Ok("".to_owned())
        }
        None => Err(Error::from(ErrorKind::GenericError(format!(
            "Transaction with id {} does not have transaction data. Not posting.",
            tx_slate_id
        )))),
    }
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_post(
    state_json: *const c_char,
    tx_slate_id: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_post(&c_str_to_rust(state_json), &c_str_to_rust(tx_slate_id)),
        error
    )
}

/// Expose the JNI interface for android below
#[cfg(target_os = "android")]
#[allow(non_snake_case)]
pub mod android {
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
));

    #[no_mangle]
    pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_balance(
        env: JNIEnv,
        _: JClass,
        state_json: JString,
        refresh_from_node: bool,
    ) -> jstring {
        let state_json: String = env.get_string(state_json).expect("Invalid state").into();
        unwrap_to_jni!(env, balance(&state_json, refresh_from_node))
    }

    #[no_mangle]
    pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_seedNew(
        env: JNIEnv,
        _: JClass,
        seed_length: jlong,
    ) -> jstring {
        unwrap_to_jni!(
            env,
            WalletSeed::init_new(seed_length as usize).to_mnemonic()
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
    pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_checkPassword(
        env: JNIEnv,
        _: JClass,
        state_json: JString,
        password: JString,
    ) -> jstring {
        let state_json: String = env.get_string(state_json).expect("Invalid state").into();
        let password: String = env.get_string(password).expect("Invalid password").into();
        unwrap_to_jni!(
            env,
            check_password(&state_json, ZeroingString::from(password))
        )
    }

    #[no_mangle]
    pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_walletScan(
        env: JNIEnv,
        _: JClass,
        state_json: JString,
        start_height: jlong,
        limit: jlong,
    ) -> jstring {
        let state_json: String = env.get_string(state_json).expect("Invalid state").into();
        unwrap_to_jni!(
            env,
            wallet_scan(&state_json, start_height as u64, limit as u64)
        )
    }
    // -----
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
        message: JString,
        amount: jlong,
        selection_strategy_is_use_all: bool,
    ) -> jstring {
        let state_json: String = env.get_string(state_json).expect("Invalid state").into();
        let message: String = env.get_string(message).expect("Invalid message").into();
        unwrap_to_jni!(
            env,
            tx_create(
                &state_json,
                &message,
                amount as u64,
                selection_strategy_is_use_all
            )
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
        slate_path: JString,
        message: JString,
    ) -> jstring {
        let state_json: String = env.get_string(state_json).expect("Invalid state").into();
        let slate_path: String = env
            .get_string(slate_path)
            .expect("Invalid slate_path")
            .into();
        let message: String = env.get_string(message).expect("Invalid message").into();
        unwrap_to_jni!(env, tx_receive(&state_json, &slate_path, &message,))
    }

    #[no_mangle]
    pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txFinalize(
        env: JNIEnv,
        _: JClass,
        state_json: JString,
        slate_path: JString,
    ) -> jstring {
        let state_json: String = env.get_string(state_json).expect("Invalid state").into();
        let slate_path: String = env
            .get_string(slate_path)
            .expect("Invalid slate_path")
            .into();
        unwrap_to_jni!(env, tx_finalize(&state_json, &slate_path))
    }

    #[no_mangle]
    pub unsafe extern "C" fn Java_app_ironbelly_GrinBridge_txSendHttps(
        env: JNIEnv,
        _: JClass,
        state_json: JString,
        amount: jlong,
        selection_strategy_is_use_all: bool,
        message: JString,
        url: JString,
    ) -> jstring {
        let state_json: String = env.get_string(state_json).expect("Invalid state").into();
        let message: String = env.get_string(message).expect("Invalid message").into();
        let url: String = env.get_string(url).expect("Invalid url").into();
        unwrap_to_jni!(
            env,
            tx_send_https(
                &state_json,
                &message,
                &url,
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
}
