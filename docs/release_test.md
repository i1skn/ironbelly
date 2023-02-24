# Manual Test

Perform this test before hitting release button in stores until we have proper e2e testing in place

## Cast

- Android - new user without a paper key
- iPhone - new user with paper key
- Carol - donor

## What to test

1. Android sends/receives using slatepack/address
2. iPhone sends/receives using slatepack/address

## Scenario

1. iPhone restores his wallet.
2. Android creates a wallet
3. Android receives 0.1 Grin via grin address from Carol
4. iPhone receives 0.1 Grin via grin address from Carol

5. iPhone sends 0.01 Grin to Android using slatepack

6. Android sends 0.1 Grin to iPhone using slatepack

7. Android sends 0.1 back to Carol
8. iPhone sends 0.1 back to Carol
9. Android and iPhone remove their accounts
   ...(Android should have 0 balance), iPhone should have original balance)
10. iPhone creates a new wallet
11. Android restores iPhone's wallet
