
typedef struct api_server {} api_server;
typedef struct wallet {} wallet;
        

#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>

typedef struct wallet wallet;

const char *c_close_wallet(wallet *opened_wallet, uint8_t *error);

const char *c_create_tor_config(wallet *wallet, const char *listen_addr, uint8_t *error);

const char *c_get_grin_address(const char *state_json, uint8_t *error);

wallet *c_open_wallet(const char *state_str, const char *password, uint8_t *error);

const char *c_seed_new(uint8_t seed_length, uint8_t *error);

const char *c_set_logger(uint8_t *error);

const char *c_slatepack_decode(const char *state_json, const char *slatepack, uint8_t *error);

api_server *c_start_listen_with_http(const char *state_json, uint8_t *error);

const char *c_stop_listen_with_http(api_server *api_server, uint8_t *error);

const char *c_tx_cancel(const char *state_json, uint32_t id, uint8_t *error);

const char *c_tx_create(const char *state_json,
                        uint64_t amount,
                        bool selection_strategy_is_use_all,
                        uint8_t *error);

const char *c_tx_finalize(const char *state_json, const char *slate_armored, uint8_t *error);

const char *c_tx_get(const char *state_json,
                     bool refresh_from_node,
                     const char *tx_slate_id,
                     uint8_t *error);

const char *c_tx_post(const char *state_json, const char *tx_slate_id, uint8_t *error);

const char *c_tx_receive(const char *state_json, const char *slate_armored, uint8_t *error);

const char *c_tx_send_address(const char *state_json,
                              uint64_t amount,
                              bool selection_strategy_is_use_all,
                              const char *address,
                              uint8_t *error);

const char *c_tx_send_https(const char *state_json,
                            uint64_t amount,
                            bool selection_strategy_is_use_all,
                            const char *url,
                            uint8_t *error);

const char *c_tx_strategies(const char *state_json, uint64_t amount, uint8_t *error);

const char *c_txs_get(const char *state_json, bool refresh_from_node, uint8_t *error);

const char *c_wallet_init(const char *state,
                          const char *phrase,
                          const char *password,
                          uint8_t *error);

const char *c_wallet_phrase(const char *state_json, uint8_t *error);

const char *c_wallet_pmmr_range(const char *state, uint8_t *error);

const char *c_wallet_scan_outputs(const char *state,
                                  uint64_t last_retrieved_index,
                                  uint64_t highest_index,
                                  uint8_t *error);

void cstr_free(char *s);
