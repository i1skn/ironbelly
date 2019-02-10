import { NativeModules } from 'react-native'
import { Client, Configuration } from 'bugsnag-react-native'
import { ToastStyles } from 'react-native-toaster'
import { store } from 'common/redux'

const { AppConfig } = NativeModules
const configuration = new Configuration()
configuration.notifyReleaseStages = ['beta', 'production']

let bugsnag
AppConfig.stage().then(stage => {
  configuration.releaseStage = stage
  bugsnag = new Client(configuration)
})

export const log = (e: Error, showToUser: boolean = false) => {
  if (!(e instanceof Error) && e.message) {
    bugsnag.notify(new Error(e.message))
  }
  if (showToUser) {
    store.dispatch({
      type: 'TOAST_SHOW',
      text: e.message,
      styles: ToastStyles.error,
    })
  }
}
