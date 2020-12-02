# Manual Test

Perform this test before hitting release button in stores until we have proper e2e testing in place (estimated time - 45:00, cost until 5.0.0 (fixed fee) - (0.634300000 - ) = 0.064 Grin)

## Cast

* Alice - new user without a paper key
* Bob - new user with paper key
* Carol - donor

## What to test

1. Alice sends/receives using file/address
2. Bob sends/receives using file/address

## Scenario

1. Alice creates a wallet
2. Alice receives 0.1 Grin via grin address from Carol - wait 10 min(-0.008)
3. Bob restores his wallet.
4. Bob receives 0.1 Grin via grin address from Carol - wait 10 min(-0.008)

5. Bob sends 0.05 Grin to Alice using copy text
6. Alice receives 0.05 Grin from Bob paste text
7. Alice respond to Bob with a response file
8. Bob finalizes the transaction with Alice. (-0.008)
...Waiting until Alice's transaction from Carol is confirmed 10 times

9. Alice sends 0.05 Grin to Bob using file
10. Bob receives 0.05 Grin from Alice using file
11. Bob respond to Alice with a text
12. Bob finalizes the transaction with Alice. (-0.008)
...Waiting until Bob's transaction is confirmed 10 times

13. Alice sends 0.084 back to Carol
14. Bob sends 0.084 back to Carol
...Waiting until both transactions are confirmed at least once

15. Alice and Bob remove their accounts
...(Alice should have 0 balance), Bob should have original balance)
16. Bob creates a new wallet
17. Alice restores Bob's wallet
