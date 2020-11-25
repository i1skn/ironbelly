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
use failure::ResultExt;
use grin_wallet_api::{self, Foreign, ForeignCheckMiddlewareFn, Owner};
use grin_wallet_config::{WalletConfig, GRIN_WALLET_DIR};
use grin_wallet_controller;
use grin_wallet_impls::tor::config as tor_config;
use grin_wallet_impls::{
    DefaultLCProvider, DefaultWalletImpl, Error, ErrorKind, HTTPNodeClient, HttpSlateSender,
    SlateSender, WalletSeed,
};
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
use serde::{Deserialize, Serialize};
use std::convert::TryFrom;
use std::fs;
use std::net::SocketAddr;
use std::path::Path;
use std::path::MAIN_SEPARATOR;
use std::sync::Arc;
use uuid::Uuid;

#[macro_use]
extern crate log;

#[cfg(target_os = "android")]
#[allow(non_snake_case)]
mod android;
#[cfg(target_os = "ios")]
mod ios;

#[derive(Serialize, Deserialize, Clone)]
struct State {
    wallet_dir: String,
    check_node_api_http_addr: String,
    chain: String,
    minimum_confirmations: u64,
    account: Option<String>,
    password: String,
}

type Wallet = Arc<
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
>;

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

fn get_wallet(state: State) -> Result<Wallet, Error> {
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

fn open_wallet(state_json: &str, password: ZeroingString) -> Result<Wallet, Error> {
    let state = State::from_str(state_json)?;
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
                lc.open_wallet(None, ZeroingString::from(password), false, false)?;
                if let Some(account) = state.account {
                    let wallet_inst = lc.wallet_inst()?;
                    wallet_inst.set_parent_key_id_by_name(&account)?;
                }
            }
        }
    }

    return Ok(wallet);
}

fn close_wallet(wallet: &Wallet) -> Result<String, Error> {
    let mut wallet_lock = wallet.lock();
    let lc = wallet_lock.lc_provider()?;
    if let Ok(open_wallet) = lc.wallet_exists(None) {
        if open_wallet {
            lc.close_wallet(None)?;
        }
    }
    Ok("Wallet has been closed".to_owned())
}

fn seed_new(seed_length: usize) -> Result<String, Error> {
    WalletSeed::init_new(seed_length, false, None).to_mnemonic()
}

fn wallet_init(state_json: &str, phrase: &str, password: &str) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;

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

    Ok("".to_owned())
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

fn wallet_phrase(state_json: &str) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let seed = WalletSeed::from_file(
        &format!("{}/{}", &state.wallet_dir, GRIN_WALLET_DIR),
        ZeroingString::from(state.password),
    )?;
    seed.to_mnemonic()
}

fn tx_get(state_json: &str, refresh_from_node: bool, tx_slate_id: &str) -> Result<String, Error> {
    let wallet = get_wallet(State::from_str(state_json)?)?;
    let api = Owner::new(wallet.clone(), None);
    let uuid = Uuid::parse_str(tx_slate_id).map_err(|e| ErrorKind::GenericError(e.to_string()))?;
    let txs = api.retrieve_txs(None, refresh_from_node, None, Some(uuid))?;
    Ok(serde_json::to_string(&txs).unwrap())
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

fn tx_cancel(state_json: &str, id: u32) -> Result<String, Error> {
    let wallet = get_wallet(State::from_str(state_json)?)?;
    // let api = Owner::new(wallet.clone(), None);
    // api.cancel_tx(None, Some(id), None)?;
    wallet_lock!(wallet, w);
    let parent_key_id = w.parent_key_id();
    tx::cancel_tx(&mut **w, None, &parent_key_id, Some(id), None)?;
    Ok("".to_owned())
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

fn tx_send_address(
    state_json: &str,
    address: &str,
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

        selection::lock_tx_context(&mut **w, None, &slate, height, &context, None)?;
        slate.compact()?;
        slate
    };

    let api = Owner::new(wallet.clone(), None);

    let address = SlatepackAddress::try_from(address)?;
    let tor_addr = OnionV3Address::try_from(&address)
        .map_err(|_| ErrorKind::GenericError(format!("{} is not SlatepackAddress", address)))?;

    let mut sender = HttpSlateSender::with_socks_proxy(
        &tor_addr.to_http_str(),
        "127.0.0.1:39059",
        "", // Ignored
    )
    .map_err(|error| {
        ErrorKind::GenericError(format!("Can not send to {}: {:?}", tor_addr, error))
    })?;

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

fn get_grin_address(state_json: &str) -> Result<String, Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;

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
    let address = SlatepackAddress::try_from(onion_address.clone())?;
    Ok(address.to_string())
}

fn start_listen_with_http(state_json: &str, apis: &mut ApiServer) -> Result<(), Error> {
    let state = State::from_str(state_json)?;
    let wallet = get_wallet(state.clone())?;
    let wallet_config = create_wallet_config(state.clone())?;

    let keychain_mask = None;

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

    warn!("Starting HTTP Foreign listener API server at {}.", addr);
    let socket_addr: SocketAddr = addr.parse().expect("unable to parse socket address");
    apis.start(socket_addr, router, None)
        .context(ErrorKind::GenericError(
            "API thread failed to start".to_string(),
        ))?;

    warn!("HTTP Foreign listener started.");
    Ok(())
}

fn create_tor_config(wallet: &Wallet, listen_addr: &str) -> Result<String, Error> {
    let mut w_lock = wallet.lock();
    let lc = w_lock.lc_provider()?;
    let w = lc.wallet_inst()?;
    let keychain_mask = None;

    let k = w.keychain((keychain_mask).as_ref())?;
    let parent_key_id = w.parent_key_id();
    let tor_config_directory = format!("{}/tor", lc.get_top_level_directory()?);

    let sec_key = address::address_from_derivation_path(&k, &parent_key_id, 0)
        .map_err(|e| ErrorKind::GenericError(e.to_string()))?;

    let tor_data_dir = format!("{}{}{}", tor_config_directory, MAIN_SEPARATOR, "data");

    // create data directory if it doesn't exist
    fs::create_dir_all(&tor_data_dir).context(ErrorKind::IO)?;

    let mut service_dirs = vec![];

    for k in &vec![sec_key] {
        let service_dir = tor_config::output_onion_service_config(&tor_config_directory, &k)?;
        service_dirs.push(service_dir.to_string());
    }

    // hidden service listener doesn't need a socks port
    tor_config::output_torrc(&tor_config_directory, listen_addr, "39059", &service_dirs)?;

    Ok("".to_owned())
}
