import { readTextValue } from './utils'

describe('Ironbelly', () => {
  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should create a new wallet', async () => {
    await expect(element(by.id('LandingScreen'))).toBeVisible()

    await element(by.id('NewWalletButton')).tap()

    //Legal
    await element(by.id('LegalDisclaimerScrollView')).scrollTo('bottom')
    let nextButton = element(by.id('IAgree'))
    await expect(nextButton).toBeVisible()
    await nextButton.tap()

    nextButton = element(by.id('SubmitPassword'))

    const passwordField = element(by.id('Password'))
    await expect(passwordField).toBeVisible()
    await passwordField.typeText('passcode')
    const passwordConfirmField = element(by.id('ConfirmPassword'))
    await expect(passwordConfirmField).toBeVisible()
    await passwordConfirmField.typeText('passcode1')
    await expect(nextButton).toBeVisible()
    // passwords are not equal, so the button is disabled
    // tap should not change anything
    await nextButton.tap()
    await passwordConfirmField.tap()
    await passwordConfirmField.typeText('passcode')
    // Now passwords are equal - buton tap should move to the next step
    await waitFor(nextButton)
      .toBeVisible()
      .withTimeout(2000)
    await expect(nextButton).toBeVisible()
    await nextButton.tap()

    const words = []
    for (let i = 0; i < 24; i++) {
      words[i] = await readTextValue(`Word${i + 1}`)
    }
    await element(by.id('ShowPaperKeyScrollView')).scrollTo('bottom')
    nextButton = element(by.id('ShowPaperKeyContinueButton'))
    await expect(nextButton).toBeVisible()
    await nextButton.tap()

    nextButton = element(by.id('VerifyPaperKeyContinueButton'))
    const wordsCount = 24
    for (let i = 0; i < wordsCount - 1; i++) {
      const word = element(by.id(`VerifyWord${i + 1}`))
      await word.typeText(words[i])
      await word.tapReturnKey()
    }
    const lastWord = element(by.id(`VerifyWord${wordsCount}`))
    await lastWord.typeText('aaaa') // enter wrong word
    await lastWord.tapReturnKey()
    // Words are invalid - button disabled
    await expect(nextButton).toBeVisible()
    await nextButton.tap()

    await lastWord.tap()
    await expect(lastWord).toBeVisible()
    await lastWord.replaceText(words[wordsCount - 1]) // enter correct word
    await lastWord.tapReturnKey()

    await expect(nextButton).toBeVisible()
    await nextButton.tap()

    nextButton = element(by.id('ShowMeButton'))
    await expect(nextButton).toBeVisible()
    await nextButton.tap()
  })
})
