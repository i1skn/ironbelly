import { MAINNET_DEFAULT_NODE, MAINNET_API_SECRET } from 'src/modules/settings'
import { store } from 'src/common/redux'
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
  1: (state: any) => {
    const unsafeNode =
      state.settings.checkNodeApiHttpAddr === 'http://grinnode.cycle42.com:3413'
    if (unsafeNode) {
      // yeah, a side effect
      store.dispatch({ type: 'SET_API_SECRET', apiSecret: MAINNET_API_SECRET })
    }
    return {
      ...state,
      settings: {
        ...state.settings,
        checkNodeApiHttpAddr: unsafeNode
          ? MAINNET_DEFAULT_NODE
          : state.settings.checkNodeApiHttpAddr,
      },
    }
  },
}
