import { MAINNET_DEFAULT_NODE } from 'src/modules/settings'
export const migrations = {
  0: (state: any) => {
    return {
      ...state,
      settings: {
        ...state.settings,
        checkNodeApiHttpAddr:
          state.settings.checkNodeApiHttpAddr ===
          'http://grinnode.cycle42.com:23413'
            ? MAINNET_DEFAULT_NODE
            : state.settings.checkNodeApiHttpAddr,
      },
    }
  },
}
