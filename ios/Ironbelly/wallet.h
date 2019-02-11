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

//free c string created in rust
void cstr_free (const char* s);

const char* c_balance(const char* path, const char* account, const char* password, const char* check_node_api_http_addr, const bool refresh_from_node, const uint8_t* );

const char* c_txs_get(const char* path,const char* account,const char* password, const char* check_node_api_http_addr, const bool refresh_from_node, const uint8_t* );

const char* c_tx_get(const char* path,const char* account,const char* password, const char* check_node_api_http_addr, const bool refresh_from_node, const uint32_t tx_id, const uint8_t* );

const char* c_tx_create(const char* path,const char* account,const char* password, const char* check_node_api_http_addr, const uint64_t amount, const bool selection_strategy_is_use_all, const char* message, const uint8_t*);

const char* c_tx_strategies(const char* path,const char* account,const char* password, const char* check_node_api_http_addr, const uint64_t amount, const uint8_t*);

const char* c_tx_cancel(const char* path,const char* account,const char* password, const char* check_node_api_http_addr, const uint32_t id, const uint8_t*);

const char* c_tx_receive(const char* path,const char* account,const char* password, const char* check_node_api_http_addr, const char* slate_path, const char* message, const uint8_t*);

const char* c_tx_finalize(const char* path,const char* account,const char* password, const char* check_node_api_http_addr, const char* slate_path, const uint8_t*);

const char* c_wallet_init(const char* path,const char* password, const char* check_node_api_http_addr, const uint8_t*);

const char* c_wallet_phrase(const char* path,const char* password, const char* check_node_api_http_addr, const uint8_t*);

const char* c_wallet_recovery(const char* path,const char* phrase,const char* password, const char* check_node_api_http_addr, const uint8_t* error);
