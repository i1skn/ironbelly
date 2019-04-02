#include <stdarg.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>

const char *c_balance(const char *path,
                      const char *account,
                      const char *password,
                      const char *check_node_api_http_addr,
                      bool refresh_from_node,
                      uint8_t *error);

const char *c_check_password(const char *path, const char *password, uint8_t *error);

const char *c_seed_new(uint8_t seed_length, uint8_t *error);

const char *c_tx_cancel(const char *path,
                        const char *account,
                        const char *password,
                        const char *check_node_api_http_addr,
                        uint32_t id,
                        uint8_t *error);

const char *c_tx_create(const char *path,
                        const char *account,
                        const char *password,
                        const char *check_node_api_http_addr,
                        uint64_t amount,
                        bool selection_strategy_is_use_all,
                        const char *message,
                        uint8_t *error);

const char *c_tx_finalize(const char *path,
                          const char *account,
                          const char *password,
                          const char *check_node_api_http_addr,
                          const char *slate_path,
                          uint8_t *error);

const char *c_tx_get(const char *path,
                     const char *account,
                     const char *password,
                     const char *check_node_api_http_addr,
                     bool refresh_from_node,
                     const char *tx_slate_id,
                     uint8_t *error);

const char *c_tx_post(const char *path,
                      const char *account,
                      const char *password,
                      const char *check_node_api_http_addr,
                      const char *tx_slate_id,
                      uint8_t *error);

const char *c_tx_receive(const char *path,
                         const char *account,
                         const char *password,
                         const char *check_node_api_http_addr,
                         const char *slate_path,
                         const char *message,
                         uint8_t *error);

const char *c_tx_send_https(const char *path,
                            const char *account,
                            const char *password,
                            const char *check_node_api_http_addr,
                            uint64_t amount,
                            bool selection_strategy_is_use_all,
                            const char *message,
                            const char *url,
                            uint8_t *error);

const char *c_tx_strategies(const char *path,
                            const char *account,
                            const char *password,
                            const char *check_node_api_http_addr,
                            uint64_t amount,
                            uint8_t *error);

const char *c_txs_get(const char *path,
                      const char *account,
                      const char *password,
                      const char *check_node_api_http_addr,
                      bool refresh_from_node,
                      uint8_t *error);

const char *c_wallet_init(const char *path,
                          const char *phrase,
                          const char *password,
                          const char *check_node_api_http_addr,
                          uint8_t *error,
                          bool is_new);

const char *c_wallet_phrase(const char *path,
                            const char *password,
                            const char *check_node_api_http_addr,
                            uint8_t *error);

void cstr_free(char *s);
