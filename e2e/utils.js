export async function readTextValue(testID) {
  try {
    await expect(element(by.id(testID))).toHaveText('__read_element_error_')
  } catch (error) {
    const start = `AX.id='${testID}';`
    const end = '; AX.frame'
    const errorMessage = error.message.toString()
    const [, restMessage] = errorMessage.split(start)
    const [label] = restMessage.split(end)
    const [, value] = label.split('=')

    return value.slice(1, value.length - 1)
  }
}
