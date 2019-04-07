// @flow
//
// Copyright 2019 Ivan Sorokin.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { connect } from 'react-redux'
import { createReduxContainer } from 'react-navigation-redux-helpers'
import {
  createReactNavigationReduxMiddleware,
  createNavigationReducer,
} from 'react-navigation-redux-helpers'
import AppNavigator from 'modules/navigation/routes'

const reducer = (AppNavigator: any) => {
  const navReducer = createNavigationReducer(AppNavigator)
  const navMiddleware = createReactNavigationReduxMiddleware('root', state => state.nav)

  return { navReducer, navMiddleware }
}

/* Routes */

const { navReducer, navMiddleware } = reducer(AppNavigator)

const App = createReduxContainer(AppNavigator)
const mapStateToProps = state => ({
  state: state.nav,
})

const Navigator = connect(mapStateToProps)(App)

export { Navigator, navReducer, navMiddleware }
