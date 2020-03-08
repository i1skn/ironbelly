import { Client, Configuration } from 'bugsnag-react-native'
const configuration = new Configuration()
configuration.notifyReleaseStages = ['production']
let bugsnag
configuration.releaseStage = __DEV__ ? 'development' : 'production' //stage

bugsnag = new Client(configuration)
export const getInstance = () => {
  return bugsnag
}
