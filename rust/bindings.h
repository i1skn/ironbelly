typedef struct api_server {} api_server;
typedef struct wallet {} wallet;

#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>

const char *c_close_wallet(uintptr_t wallet_ptr, uint8_t *error);

const char *c_create_tor_config(uintptr_t wallet, const char *listen_addr, uint8_t *error);

const char *c_get_grin_address(uintptr_t wallet_ptr, uint8_t *error);

void c_init_mainnet(void);

void c_init_testnet(void);

uintptr_t c_open_wallet(const char *config_str, const char *password, uint8_t *error);

const char *c_seed_new(uint8_t seed_length, uint8_t *error);

void c_set_logger(void);

const char *c_slatepack_decode(const char *slatepack, uint8_t *error);

uintptr_t c_start_listen_with_http(uintptr_t wallet_ptr,
                                   const char *api_listen_addr,
                                   uint8_t *error);

const char *c_stop_listen_with_http(uintptr_t api_server, uint8_t *error);

const char *c_tx_cancel(uintptr_t wallet_ptr, uint32_t id, uint8_t *error);

const char *c_tx_create(uintptr_t wallet_ptr,
                        uint64_t amount,
                        uint64_t minimum_confirmations,
                        bool selection_strategy_is_use_all,
                        uint8_t *error);

const char *c_tx_finalize(uintptr_t wallet_ptr, const char *slate_armored, uint8_t *error);

const char *c_tx_get(uintptr_t wallet_ptr,
                     bool refresh_from_node,
                     const char *tx_slate_id,
                     uint8_t *error);

const char *c_tx_post(uintptr_t wallet_ptr, const char *tx_slate_id, uint8_t *error);

const char *c_tx_receive(uintptr_t wallet_ptr,
                         const char *account,
                         const char *slate_armored,
                         uint8_t *error);

const char *c_tx_send_address(uintptr_t wallet_ptr,
                              uint64_t amount,
                              uint64_t minimum_confirmations,
                              bool selection_strategy_is_use_all,
                              const char *address,
                              uint8_t *error);

const char *c_tx_strategies(uintptr_t wallet_ptr,
                            uint64_t amount,
                            uint64_t minimum_confirmations,
                            uint8_t *error);

const char *c_txs_get(uintptr_t wallet_ptr,
                      uint64_t minimum_confirmations,
                      bool refresh_from_node,
                      uint8_t *error);

const char *c_wallet_init(const char *config_str,
                          const char *phrase,
                          const char *password,
                          uint8_t *error);

const char *c_wallet_phrase(const char *wallet_dir, const char *password, uint8_t *error);

const char *c_wallet_pmmr_range(uintptr_t wallet_ptr, uint8_t *error);

const char *c_wallet_scan_outputs(uintptr_t wallet_ptr,
                                  uint64_t last_retrieved_index,
                                  uint64_t highest_index,
                                  uint8_t *error);

void cstr_free(char *s);
