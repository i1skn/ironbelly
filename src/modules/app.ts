import { Epic, combineEpics, ofType } from 'redux-observable'
import { Client, Configuration } from 'bugsnag-react-native'
import {
  filter,
  ignoreElements,
  catchError,
  take,
  mergeMap,
  map,
  tap,
} from 'rxjs/operators'
import RNFS from 'react-native-fs'
import { Action, Slate, State as RootState } from 'src/common/types'
import { getNavigation } from 'src/modules/navigation'
import { isResponseSlate } from 'src/common'
import { of, partition, merge } from 'rxjs'
import { MAINNET_CHAIN, FLOONET_CHAIN } from 'src/modules/settings'
import { log } from 'src/common/logger'
// @ts-ignore
import Countly from 'countly-sdk-react-native-bridge'

export type State = {
  unopenedSlatePath: string
  legalAccepted: boolean
}
export const initialState: State = {
  unopenedSlatePath: '',
  legalAccepted: false,
}

export const appReducer = (
  state: State = initialState,
  action: Action,
): State => {
  switch (action.type) {
    case 'SLATE_LOAD_REQUEST':
      return {
        ...state,
        unopenedSlatePath: action.slatePath,
      }
    case 'SLATE_LOAD_SUCCESS':
      return {
        ...state,
        unopenedSlatePath: '',
      }
    case 'ACCEPT_LEGAL':
      return {
        ...state,
        legalAccepted: action.value,
      }
    default:
      return state
  }
}

export const handleOpenSlateEpic: Epic<Action, Action, RootState> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType('VALID_PASSWORD', 'SLATE_LOAD_REQUEST'),
    filter(
      () =>
        !!state$.value.app.unopenedSlatePath &&
        state$.value.wallet.password.valid,
    ),
    mergeMap(async () => {
      const slate: Slate = await RNFS.readFile(
        state$.value.app.unopenedSlatePath,
        'utf8',
      ).then((json: string) => JSON.parse(json))
      return {
        type: 'SLATE_LOAD_SUCCESS',
        slate,
        slatePath: state$.value.app.unopenedSlatePath,
      } as Action
    }),
    catchError((error) => {
      log(error, true)
      return of({
        type: 'SLATE_SET_FAILURE',
        code: 1,
        message: error.message,
      } as Action)
    }),
  )

export const handleOpenedSlateEpic: Epic<Action, Action, RootState> = (
  action$,
  _state$,
) => {
  // const navigation = await getNavigation()
  const [response$, request$] = partition(
    action$.pipe(
      filter(({ type }) => type === 'SLATE_LOAD_SUCCESS'),
      mergeMap(async (action) => {
        // @ts-ignore
        const { slate } = action
        const isResponse = await isResponseSlate(slate)
        return { ...action, isResponse }
      }),
    ),
    ({ isResponse }) => isResponse,
  )
  const combined$ = merge(
    request$.pipe(
      // @ts-ignore
      tap(async ({ slate, slatePath }) => {
        const navigation = await getNavigation()
        navigation?.navigate('Receive', { slate, slatePath })
      }),
      ignoreElements(),
    ),
    response$.pipe(
      // @ts-ignore
      map(({ slatePath }) => {
        return {
          type: 'TX_FINALIZE_REQUEST',
          responseSlatePath: slatePath,
        } as Action
      }),
    ),
  )

  return combined$
}

const thirdPartyEpic: Epic<Action, Action, RootState> = (action$, state$) => {
  return action$.pipe(
    filter(() => state$.value.app.legalAccepted),
    tap(() => {
      // Countly
      const serverURL = 'https://analytics.i1skn.dev'
      const appKey = '94809c388e9eced2c2c297a3acb368ab26161ae0'
      Countly.init(serverURL, appKey)
      Countly.enableParameterTamperingProtection('salt')
      // Run only on mainnet in release build
      if (!__DEV__ && state$.value.settings.chain === MAINNET_CHAIN) {
        Countly.start()
      }

      // BugSnag
      const configuration = new Configuration()
      // Run only in release builds
      configuration.notifyReleaseStages = [MAINNET_CHAIN, FLOONET_CHAIN]
      configuration.releaseStage = __DEV__
        ? 'development'
        : state$.value.settings.chain //stage
      new Client(configuration)
    }),
    take(1),
    ignoreElements(),
  )
}

const checkBiometryEpic: Epic<Action, Action, RootState> = () => {
  return of({
    type: 'CHECK_BIOMETRY_REQUEST',
  })
}

export const appEpic: Epic<Action, Action, RootState> = combineEpics(
  checkBiometryEpic,
  handleOpenSlateEpic,
  handleOpenedSlateEpic,
  thirdPartyEpic,
)
