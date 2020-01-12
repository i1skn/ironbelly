import { MAINNET_DEFAULT_NODE, MAINNET_DEFAULT_NODE_V2 } from 'modules/settings'
export const migrations = {
  0: (state: any) => {
    return {
      ...state,
      settings: {
        ...state.settings,
        checkNodeApiHttpAddr:
          state.settings.checkNodeApiHttpAddr === MAINNET_DEFAULT_NODE_V2
            ? MAINNET_DEFAULT_NODE
            : state.settings.checkNodeApiHttpAddr,
      },
    }
  },
}

