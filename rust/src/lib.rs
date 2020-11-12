/**
 * Copyright 2019 Ironbelly Devs
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
use grin_wallet_impls::tor::config as tor_config;

use std::net::SocketAddr;

use failure::ResultExt;

use grin_wallet_controller;
use grin_wallet_libwallet::{
    address, scan, selection, slate_versions, tx, updater, wallet_lock, NodeClient,
    NodeVersionInfo, Slate, SlateVersion, SlatepackAddress, SlatepackArmor, Slatepacker,
    SlatepackerArgs, VersionedSlate, WalletInst, WalletLCProvider,
};
use grin_wallet_util::grin_api::{ApiServer, Router};
use grin_wallet_util::grin_core::global;
use grin_wallet_util::grin_core::global::ChainTypes;
use grin_wallet_util::grin_keychain::{ExtKeychain, Keychain};
use grin_wallet_util::grin_util::file::get_first_line;
use grin_wallet_util::grin_util::Mutex;
use grin_wallet_util::grin_util::ZeroingString;
use grin_wallet_util::OnionV3Address;
use std::convert::TryFrom;
use std::path::Path;

use grin_wallet_config::{WalletConfig, GRIN_WALLET_DIR};
use grin_wallet_impls::{
    DefaultLCProvider, DefaultWalletImpl, Error, ErrorKind, HTTPNodeClient, HttpSlateSender,
    SlateSender, WalletSeed,
};

use grin_wallet_api::{self, Foreign, ForeignCheckMiddlewareFn, Owner};
use serde::{Deserialize, Serialize};
use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::sync::Arc;
use uuid::Uuid;
#[macro_use]
extern crate log;

use simplelog::{Config, LevelFilter, SimpleLogger};

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
        "floonet" => ChainTypes::Testnet,
        "usertesting" => ChainTypes::UserTesting,
        "automatedtesting" => ChainTypes::AutomatedTesting,
        _ => ChainTypes::Testnet,
    };

    let api_secret_path = state.wallet_dir.clone() + "/.api_secret";
    Ok(WalletConfig {
        chain_type: Some(chain_type),
        api_listen_interface: "127.0.0.1".to_string(),
        api_listen_port: 3415,
        api_secret_path: None,
        node_api_secret_path: if Path::new(&api_secret_path).exists() {
            Some(api_secret_path)
        } else {
            None
        },
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
    global::set_local_chain_type(wallet_config.chain_type.as_ref().unwrap().clone());

    let node_api_secret = get_first_line(wallet_config.node_api_secret_path.clone());

    let node_client = HTTPNodeClient::new(&wallet_config.check_node_api_http_addr, node_api_secret);
    let wallet = inst_wallet::<
        DefaultLCProvider<HTTPNodeClient, ExtKeychain>,
        HTTPNodeClient,
        ExtKeychain,
    >(wallet_config.clone(), node_client)?;
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
    WalletSeed::init_new(seed_length, false, None).to_mnemonic()
}

fn e2e_seed_new() -> Result<String, Error> {
    Ok("confirm erupt mirror palace hockey final admit announce minimum apple work slam return jeans lobster chalk fatal sense prison water host fat eagle seed".to_owned())
}

#[no_mangle]
pub unsafe extern "C" fn c_seed_new(seed_length: u8, error: *mut u8) -> *const c_char {
    unwrap_to_c_with_e2e!(e2e_seed_new(), seed_new(seed_length as usize), error)
}

fn wallet_init(state_json: &str, phrase: &str, password: &str) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;
    let wallet_config = create_wallet_config(state.clone())?;

    // create wallet
    let mut wallet_lock = wallet.lock();
    let lc = wallet_lock.lc_provider()?;
    lc.create_wallet(
        None,
        Some(ZeroingString::from(phrase)),
        32,
        ZeroingString::from(password),
        false,
        true,
    )?;

    // create TOR config
    let w_inst = lc.wallet_inst()?;
    let k = w_inst.keychain((None).as_ref())?;
    let parent_key_id = w_inst.parent_key_id();
    let tor_dir = format!("{}/tor/listener", lc.get_top_level_directory()?);
    let sec_key = address::address_from_derivation_path(&k, &parent_key_id, 0)
        .map_err(|e| ErrorKind::GenericError(e.to_string()))?;
    tor_config::output_tor_listener_config(
        &tor_dir,
        &wallet_config.api_listen_addr(),
        &vec![sec_key],
    )
    .map_err(|e| ErrorKind::GenericError(format!("{:?}", e).into()))?;

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

fn wallet_scan_outputs(
    state_json: &str,
    last_retrieved_index: u64,
    highest_index: u64,
) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state)?;
    let info = scan(
        wallet.clone(),
        None,
        false,
        (last_retrieved_index, highest_index),
        &None,
    )?;
    debug!("Info: {:?}", info);

    let result = info.last_pmmr_index;

    let parent_key_id = {
        wallet_lock!(wallet, w);
        w.parent_key_id().clone()
    };
    {
        wallet_lock!(wallet, w);
        let mut batch = w.batch(None)?;
        batch.save_last_confirmed_height(&parent_key_id, info.height)?;
        batch.commit()?;
    };

    Ok(serde_json::to_string(&result).unwrap())
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_scan_outputs(
    state: *const c_char,
    last_retrieved_index: u64,
    highest_index: u64,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        wallet_scan_outputs(&c_str_to_rust(state), last_retrieved_index, highest_index),
        error
    )
}

fn wallet_pmmr_range(state_json: &str) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state)?;
    let client = {
        wallet_lock!(wallet, w);
        w.w2n_client().clone()
    };
    let pmmr_range = client.height_range_to_pmmr_indices(0, None)?;
    Ok(serde_json::to_string(&pmmr_range).unwrap())
}

#[no_mangle]
pub unsafe extern "C" fn c_wallet_pmmr_range(
    state: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(wallet_pmmr_range(&c_str_to_rust(state)), error)
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
    let api = Owner::new(wallet.clone(), None);
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

fn update_state<'a, L, C, K>(
    wallet_inst: Arc<Mutex<Box<dyn WalletInst<'a, L, C, K>>>>,
) -> Result<bool, Error>
where
    L: WalletLCProvider<'a, C, K>,
    C: NodeClient + 'a,
    K: Keychain + 'a,
{
    let parent_key_id = {
        wallet_lock!(wallet_inst, w);
        w.parent_key_id().clone()
    };
    let mut client = {
        wallet_lock!(wallet_inst, w);
        w.w2n_client().clone()
    };
    let tip = client.get_chain_tip()?;

    // Step 1: Update outputs and transactions purely based on UTXO state

    {
        wallet_lock!(wallet_inst, w);
        if !match updater::refresh_output_state(&mut **w, None, tip.0, &parent_key_id, true) {
            Ok(_) => true,
            Err(_) => false,
        } {
            // We are unable to contact the node
            return Ok(false);
        }
    }

    let mut txs = {
        wallet_lock!(wallet_inst, w);
        updater::retrieve_txs(&mut **w, None, None, Some(&parent_key_id), true)?
    };

    for tx in txs.iter_mut() {
        // Step 2: Cancel any transactions with an expired TTL
        if let Some(e) = tx.ttl_cutoff_height {
            if tip.0 >= e {
                wallet_lock!(wallet_inst, w);
                let parent_key_id = w.parent_key_id();
                tx::cancel_tx(&mut **w, None, &parent_key_id, Some(tx.id), None)?;
                continue;
            }
        }
        // Step 3: Update outstanding transactions with no change outputs by kernel
        if tx.confirmed {
            continue;
        }
        if tx.amount_debited != 0 && tx.amount_credited != 0 {
            continue;
        }
        if let Some(e) = tx.kernel_excess {
            let res = client.get_kernel(&e, tx.kernel_lookup_min_height, Some(tip.0));
            let kernel = match res {
                Ok(k) => k,
                Err(_) => return Ok(false),
            };
            if let Some(k) = kernel {
                debug!("Kernel Retrieved: {:?}", k);
                wallet_lock!(wallet_inst, w);
                let mut batch = w.batch(None)?;
                tx.confirmed = true;
                tx.update_confirmation_ts();
                batch.save_tx_log_entry(tx.clone(), &parent_key_id)?;
                batch.commit()?;
            }
        }
    }

    return Ok(true);
}

fn txs_get(state_json: &str, refresh_from_node: bool) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;

    let refreshed = refresh_from_node && update_state(wallet.clone()).unwrap_or(false);
    let wallet_info = {
        wallet_lock!(wallet, w);
        let parent_key_id = w.parent_key_id();
        updater::retrieve_info(&mut **w, &parent_key_id, state.minimum_confirmations)?
    };
    let api = Owner::new(wallet.clone(), None);

    let txs = api.retrieve_txs(None, false, None, None)?;
    let result = (refreshed, txs.1, wallet_info);
    Ok(serde_json::to_string(&result).unwrap())
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

#[derive(Serialize, Deserialize)]
struct Strategy {
    selection_strategy_is_use_all: bool,
    total: u64,
    fee: u64,
}

fn tx_strategies(state_json: &str, amount: u64) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;
    let mut result = vec![];
    wallet_lock!(wallet, w);
    let parent_key_id = w.parent_key_id().clone();
    let client = w.w2n_client().clone();
    let tip = client.get_chain_tip()?;
    for selection_strategy_is_use_all in vec![true, false].into_iter() {
        if let Ok((_coins, total, _amount, fee)) = selection::select_coins_and_fee(
            &mut **w,
            amount,
            tip.0,
            state.minimum_confirmations,
            500,
            1,
            selection_strategy_is_use_all,
            &parent_key_id,
        ) {
            result.push(Strategy {
                selection_strategy_is_use_all,
                total,
                fee,
            })
        }
    }
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
    amount: u64,
    selection_strategy_is_use_all: bool,
) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;
    let parent_key_id = {
        wallet_lock!(wallet, w);
        w.parent_key_id().clone()
    };

    let slate = {
        wallet_lock!(wallet, w);
        let mut slate = tx::new_tx_slate(&mut **w, amount, false, 2, false, None)?;
        let height = w.w2n_client().get_chain_tip()?.0;

        let context = tx::add_inputs_to_slate(
            &mut **w,
            None,
            &mut slate,
            height,
            state.minimum_confirmations,
            500,
            1,
            selection_strategy_is_use_all,
            &parent_key_id,
            true,
            false,
        )?;

        {
            let mut batch = w.batch(None)?;
            batch.save_private_context(slate.id.as_bytes(), &context)?;
            batch.commit()?;
        }

        // slate.version_info.version = 2;
        // slate.version_info.orig_version = 2;
        selection::lock_tx_context(&mut **w, None, &slate, height, &context, None)?;
        slate.compact()?;
        slate
    };

    let packer = Slatepacker::new(SlatepackerArgs {
        sender: None, // sender
        recipients: vec![],
        dec_key: None,
    });
    let slatepack = packer.create_slatepack(&slate)?;
    let api = Owner::new(wallet.clone(), None);
    let txs = api.retrieve_txs(None, false, None, Some(slate.id))?;
    let result = (
        txs.1,
        SlatepackArmor::encode(&slatepack).map_err(|e| ErrorKind::GenericError(e.to_string()))?,
    );

    Ok(serde_json::to_string(&result).map_err(|e| ErrorKind::GenericError(e.to_string()))?)
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
            &c_str_to_rust(state_json),
            amount,
            selection_strategy_is_use_all,
        ),
        error
    )
}

fn tx_cancel(state_json: &str, id: u32) -> Result<String, Error> {
    let wallet = get_wallet(State::from_str(state_json)?)?;
    // let api = Owner::new(wallet.clone(), None);
    // api.cancel_tx(None, Some(id), None)?;
    wallet_lock!(wallet, w);
    let parent_key_id = w.parent_key_id();
    tx::cancel_tx(&mut **w, None, &parent_key_id, Some(id), None)?;
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

fn check_middleware(
    name: ForeignCheckMiddlewareFn,
    node_version_info: Option<NodeVersionInfo>,
    slate: Option<&Slate>,
) -> Result<(), grin_wallet_libwallet::Error> {
    match name {
        // allow coinbases to be built regardless
        ForeignCheckMiddlewareFn::BuildCoinbase => Ok(()),
        _ => {
            let mut bhv = 3;
            if let Some(n) = node_version_info {
                bhv = n.block_header_version;
            }
            if let Some(s) = slate {
                if bhv > 4
                    && s.version_info.block_header_version
                        < slate_versions::GRIN_BLOCK_HEADER_VERSION
                {
                    Err(grin_wallet_libwallet::ErrorKind::Compatibility(
                        "Incoming Slate is not compatible with this wallet. \
						 Please upgrade the node or use a different one."
                            .into(),
                    ))?;
                }
            }
            Ok(())
        }
    }
}

fn tx_receive(state_json: &str, slate_armored: &str) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;
    let foreign_api = Foreign::new(wallet.clone(), None, Some(check_middleware), false);
    let owner_api = Owner::new(wallet.clone(), None);

    let mut slate =
        owner_api.slate_from_slatepack_message(None, slate_armored.to_owned(), vec![0])?;
    let slatepack = owner_api.decode_slatepack_message(None, slate_armored.to_owned(), vec![0])?;

    let _ret_address = slatepack.sender;

    if let Some(account) = state.account {
        slate = foreign_api.receive_tx(&slate, Some(&account), None)?;
        let txs = owner_api.retrieve_txs(None, false, None, Some(slate.id))?;
        let packer = Slatepacker::new(SlatepackerArgs {
            sender: None, // sender
            recipients: vec![],
            dec_key: None,
        });
        let slatepack = packer.create_slatepack(&slate)?;
        let result = (
            txs.1,
            SlatepackArmor::encode(&slatepack)
                .map_err(|e| ErrorKind::GenericError(e.to_string()))?,
        );

        Ok(serde_json::to_string(&result).map_err(|e| ErrorKind::GenericError(e.to_string()))?)
    } else {
        Err(Error::from(ErrorKind::GenericError(
            "Account is not specified".to_owned(),
        )))
    }
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_receive(
    state_json: *const c_char,
    slate_armored: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_receive(&c_str_to_rust(state_json), &c_str_to_rust(slate_armored),),
        error
    )
}

fn tx_finalize(state_json: &str, slate_armored: &str) -> Result<String, Error> {
    let wallet = get_wallet(State::from_str(state_json)?)?;
    let owner_api = Owner::new(wallet.clone(), None);
    // let mut slate = PathToSlate((&slate_path).into()).get_tx()?;
    let mut slate =
        owner_api.slate_from_slatepack_message(None, slate_armored.to_owned(), vec![0])?;
    let slatepack = owner_api.decode_slatepack_message(None, slate_armored.to_owned(), vec![0])?;

    let _ret_address = slatepack.sender;

    slate = owner_api.finalize_tx(None, &slate)?;
    let txs = owner_api.retrieve_txs(None, false, None, Some(slate.id))?;

    Ok(serde_json::to_string(&txs.1).map_err(|e| ErrorKind::GenericError(e.to_string()))?)
}

#[no_mangle]
pub unsafe extern "C" fn c_tx_finalize(
    state_json: *const c_char,
    slate_armored: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_finalize(&c_str_to_rust(state_json), &c_str_to_rust(slate_armored),),
        error
    )
}

fn tx_send_https(
    state_json: &str,
    url: &str,
    amount: u64,
    selection_strategy_is_use_all: bool,
) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;
    let parent_key_id = {
        wallet_lock!(wallet, w);
        w.parent_key_id().clone()
    };

    let slate = {
        wallet_lock!(wallet, w);
        let mut slate = tx::new_tx_slate(&mut **w, amount, false, 2, false, None)?;
        let height = w.w2n_client().get_chain_tip()?.0;

        let context = tx::add_inputs_to_slate(
            &mut **w,
            None,
            &mut slate,
            height,
            state.minimum_confirmations,
            500,
            1,
            selection_strategy_is_use_all,
            &parent_key_id,
            true,
            false,
        )?;

        {
            let mut batch = w.batch(None)?;
            batch.save_private_context(slate.id.as_bytes(), &context)?;
            batch.commit()?;
        }

        // slate.version_info.version = 4;
        // slate.version_info.orig_version = 2;
        selection::lock_tx_context(&mut **w, None, &slate, height, &context, None)?;
        slate.compact()?;
        slate
    };

    let api = Owner::new(wallet.clone(), None);

    let mut sender = Box::new(
        HttpSlateSender::new(url)
            .map_err(|_| ErrorKind::GenericError(format!("Invalid destination URL: {}", url)))?,
    );

    match sender.send_tx(&slate, false) {
        Ok(mut slate) => {
            api.finalize_tx(None, &mut slate)?;
            Ok(serde_json::to_string(&slate.id)
                .map_err(|e| ErrorKind::GenericError(e.to_string()))?)
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
    url: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        tx_send_https(
            &c_str_to_rust(state_json),
            &c_str_to_rust(url),
            amount,
            selection_strategy_is_use_all,
        ),
        error
    )
}

fn tx_post(state_json: &str, tx_slate_id: &str) -> Result<String, Error> {
    let wallet = get_wallet(State::from_str(state_json)?)?;
    let api = Owner::new(wallet.clone(), None);
    let tx_uuid =
        Uuid::parse_str(tx_slate_id).map_err(|e| ErrorKind::GenericError(e.to_string()))?;
    let (_, txs) = api.retrieve_txs(None, true, None, Some(tx_uuid.clone()))?;
    if txs[0].confirmed {
        return Err(Error::from(ErrorKind::GenericError(format!(
            "Transaction with id {} is already confirmed. Not posting.",
            tx_slate_id
        ))));
    }
    let stored_tx = api.get_stored_tx(None, None, Some(&tx_uuid))?;
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

fn slatepack_decode(state_json: &str, slatepack: &str) -> Result<String, Error> {
    let _ = get_wallet(State::from_str(state_json)?)?;
    let packer = Slatepacker::new(SlatepackerArgs {
        sender: None,
        recipients: vec![],
        dec_key: None,
    });
    let slatepack = packer.deser_slatepack(slatepack.as_bytes(), true)?;
    let slate = packer.get_slate(&slatepack)?;
    Ok(serde_json::to_string(&VersionedSlate::into_version(
        slate.clone(),
        SlateVersion::V4,
    )?)
    .map_err(|e| ErrorKind::GenericError(e.to_string()))?)
}

#[no_mangle]
pub unsafe extern "C" fn c_slatepack_decode(
    state_json: *const c_char,
    slatepack: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(
        slatepack_decode(&c_str_to_rust(state_json), &c_str_to_rust(slatepack)),
        error
    )
}

fn listen_with_http(state_json: &str) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;
    let wallet_config = create_wallet_config(state.clone())?;

    let keychain_mask = None;

    let mut w_lock = wallet.lock();
    let lc = w_lock.lc_provider()?;
    let w_inst = lc.wallet_inst()?;
    let k = w_inst.keychain((keychain_mask).as_ref())?;
    let parent_key_id = w_inst.parent_key_id();
    let sec_key = address::address_from_derivation_path(&k, &parent_key_id, 0)
        .map_err(|e| ErrorKind::GenericError(e.to_string()))?;
    let onion_address = OnionV3Address::from_private(&sec_key.0)
        .map_err(|e| ErrorKind::GenericError(format!("{:?}", e).into()))?;
    let sp_address = SlatepackAddress::try_from(onion_address.clone())?;

    let addr = &wallet_config.api_listen_addr();

    let api_handler_v2 = grin_wallet_controller::ForeignAPIHandlerV2::new(
        wallet.clone(),
        Arc::new(Mutex::new(keychain_mask)),
        false,
        Mutex::new(None),
    );
    let mut router = Router::new();

    router
        .add_route("/v2/foreign", Arc::new(api_handler_v2))
        .map_err(|_| ErrorKind::GenericError("Router failed to add route".to_string()))?;

    let mut apis = ApiServer::new();
    warn!("Starting HTTP Foreign listener API server at {}.", addr);
    let socket_addr: SocketAddr = addr.parse().expect("unable to parse socket address");
    let api_thread = apis
        .start(socket_addr, router, None)
        .context(ErrorKind::GenericError(
            "API thread failed to start".to_string(),
        ))?;

    warn!("HTTP Foreign listener started.");
    warn!("Slatepack Address is: {}", sp_address);

    // api_thread
    // .join()
    // .map_err(|_| ErrorKind::GenericError("API thread panicked".to_string()))?;
    // .map_err(|e| ErrorKind::GenericError(format!("API thread panicked :{:?}", e)).into());

    Ok(sp_address.to_string())
}

#[no_mangle]
pub unsafe extern "C" fn c_listen_with_http(
    state_json: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(listen_with_http(&c_str_to_rust(state_json)), error)
}

fn create_tor_config(state_json: &str) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;
    let wallet_config = create_wallet_config(state.clone())?;

    let keychain_mask = None;

    let mut w_lock = wallet.lock();
    let lc = w_lock.lc_provider()?;

    let addr = &wallet_config.api_listen_addr();

    let w_inst = lc.wallet_inst()?;
    let k = w_inst.keychain((keychain_mask).as_ref())?;
    let parent_key_id = w_inst.parent_key_id();
    let tor_dir = format!("{}/tor/listener", lc.get_top_level_directory()?);
    let sec_key = address::address_from_derivation_path(&k, &parent_key_id, 0)
        .map_err(|e| ErrorKind::GenericError(e.to_string()))?;
    tor_config::output_tor_listener_config(&tor_dir, &addr, &vec![sec_key])
        .map_err(|e| ErrorKind::GenericError(format!("{:?}", e).into()))?;

    Ok("".to_owned())
}

#[no_mangle]
pub unsafe extern "C" fn c_create_tor_config(
    state_json: *const c_char,
    error: *mut u8,
) -> *const c_char {
    unwrap_to_c!(create_tor_config(&c_str_to_rust(state_json)), error)
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

    extern crate android_logger;

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
}
