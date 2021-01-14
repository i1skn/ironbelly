# Manual Test

Perform this test before hitting release button in stores until we have proper e2e testing in place

## Cast

* Android - new user without a paper key
* iPhone - new user with paper key
* Carol - donor

## What to test

1. Android sends/receives using slatepack/address
2. iPhone sends/receives using slatepack/address

## Scenario

1. iPhone restores his wallet.
2. Android creates a wallet
3. Android receives 0.1 Grin via grin address from Carol - wait 10 min(-0.008)
4. iPhone receives 0.1 Grin via grin address from Carol - wait 10 min(-0.008)

5. iPhone sends 0.05 Grin to Android using copy text
6. Android receives 0.05 Grin from iPhone paste text
7. Android shows to iPhone a QR code
8. iPhone finalizes the transaction with Android. (-0.023)
...Waiting until Android's transaction from Carol is confirmed 10 times

9. Android sends 0.05 Grin to iPhone via showing a QR code
10. iPhone receives 0.05 Grin from Android scanning a QR code
11. iPhone respond to Android with a text
12. Android finalizes the transaction with Android. (-0.023)
...Waiting until iPhone's transaction is confirmed 10 times

13. Android sends 0.053 (+0.024 fee) back to Carol
14. iPhone sends 0.053 (+0.024 fee) back to Carol
...Waiting until both transactions are confirmed at least once

15. Android and iPhone remove their accounts
...(Android should have 0 balance), iPhone should have original balance)
16. iPhone creates a new wallet
17. Android restores iPhone's wallet
