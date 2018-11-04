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

#include <stdint.h>

struct wallet;
// string
struct rust_string;

// string_ptr
struct rust_string_ptr {
	const uint8_t* ptr;
	size_t len;
};

// return ptr to rust_str
struct rust_string_ptr* rust_string_ptr(const struct rust_string* s);

// removes rust string
void rust_string_destroy(struct rust_string* s);

// removes string pointer
void rust_string_ptr_destroy(struct rust_string_ptr* s);

struct rust_string* c_balance(const struct rust_string_ptr* path,const struct rust_string_ptr* account,const struct rust_string_ptr* password, const struct rust_string_ptr* check_node_api_http_addr, const bool refresh_from_node, const uint8_t* );

struct rust_string* c_txs_get(const struct rust_string_ptr* path,const struct rust_string_ptr* account,const struct rust_string_ptr* password, const struct rust_string_ptr* check_node_api_http_addr, const bool refresh_from_node, const uint8_t* );

struct rust_string* c_tx_get(const struct rust_string_ptr* path,const struct rust_string_ptr* account,const struct rust_string_ptr* password, const struct rust_string_ptr* check_node_api_http_addr, const bool refresh_from_node, const uint32_t tx_id, const uint8_t* );

struct rust_string* c_tx_create(const struct rust_string_ptr* path,const struct rust_string_ptr* account,const struct rust_string_ptr* password, const struct rust_string_ptr* check_node_api_http_addr, const uint64_t amount, const bool selection_strategy_is_use_all, const struct rust_string_ptr* message, const uint8_t*);

struct rust_string* c_tx_strategies(const struct rust_string_ptr* path,const struct rust_string_ptr* account,const struct rust_string_ptr* password, const struct rust_string_ptr* check_node_api_http_addr, const uint64_t amount, const uint8_t*);

struct rust_string* c_tx_cancel(const struct rust_string_ptr* path,const struct rust_string_ptr* account,const struct rust_string_ptr* password, const struct rust_string_ptr* check_node_api_http_addr, const uint32_t id, const uint8_t*);

struct rust_string* c_tx_receive(const struct rust_string_ptr* path,const struct rust_string_ptr* account,const struct rust_string_ptr* password, const struct rust_string_ptr* check_node_api_http_addr, const struct rust_string_ptr* slate_path, const struct rust_string_ptr* message, const uint8_t*);

struct rust_string* c_tx_finalize(const struct rust_string_ptr* path,const struct rust_string_ptr* account,const struct rust_string_ptr* password, const struct rust_string_ptr* check_node_api_http_addr, const struct rust_string_ptr* slate_path, const uint8_t*);

struct rust_string* c_wallet_init(const struct rust_string_ptr* path,const struct rust_string_ptr* password, const struct rust_string_ptr* check_node_api_http_addr, const uint8_t*);

struct rust_string* c_wallet_phrase(const struct rust_string_ptr* path,const struct rust_string_ptr* password, const struct rust_string_ptr* check_node_api_http_addr, const uint8_t*);

struct rust_string* c_wallet_recovery(const struct rust_string_ptr* path,const struct rust_string_ptr* phrase,const struct rust_string_ptr* password, const struct rust_string_ptr* check_node_api_http_addr, const uint8_t* error);

