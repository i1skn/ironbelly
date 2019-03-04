describe('Ironbelly', () => {
  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should create a new wallet', async () => {
    await expect(element(by.id('LandingScreen'))).toBeVisible()

    await element(by.id('NewWalletButton')).tap()

    const nextButton = element(by.id('ManyStepsNextButton'))
    await expect(nextButton).toBeVisible()

    const passwordEnterField = element(by.id('EnterPassword'))
    await expect(passwordEnterField).toBeVisible()
    await passwordEnterField.typeText('passcode')
    await nextButton.tap()

    const passwordConfirmField = element(by.id('ConfirmPassword'))
    await expect(passwordConfirmField).toBeVisible()
    await passwordConfirmField.typeText('passcode')
    await nextButton.tap()

    const mnemonic = element(by.id('Mnemonic12'))
    await expect(mnemonic).toBeVisible()
    const finishButton = element(by.id('MnemonicFinishButton'))
    await expect(finishButton).toBeVisible()
    await finishButton.tap()

    await expect(element(by.id('TopUpButton'))).toBeVisible()
  })
})
