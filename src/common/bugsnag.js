import { NativeModules } from 'react-native'
import { Client, Configuration } from 'bugsnag-react-native'
const { AppConfig } = NativeModules
const configuration = new Configuration()
configuration.notifyReleaseStages = ['beta', 'production']

let bugsnag

AppConfig.stage().then(stage => {
  configuration.releaseStage = stage
  bugsnag = new Client(configuration)
})

export const getInstance = () => {
  return bugsnag
}
