# Manual Test

Perform this test before hitting release button in stores until we have proper
e2e testing in place
(estimated time - ??:??, cost until 5.0.0 (fixed fee) - 0.064 Grin)

## Cast

* Alice - new user without a paper key
* Bob - new user with paper key
* Carol - donor

## What to test

1. Alice sends/receives using file/address
2. Bob sends/receives using file/address

## Scenario

1. Alice creates a wallet
2. Alice receives 0.1 Grin via grin address from Carol
3. Bob restores his wallet.
4. Bob receives 0.1 Grin via grin address from Carol
5. Alice sends 0.05 Grin to Bob using file
6. Bob receives 0.05 Grin from Alice using file
7. Bob sends 0.05 Grin to Alice using file
8. Alice receives 0.05 Grin from Bob using file
9. Alice sends 0.042 back to Carol
10. Bob sends 0.042 back to Carol
11. Alice and Bob remove their accounts
12. Bob creates a new wallet
13. Alice restores another known wallet with some balance
