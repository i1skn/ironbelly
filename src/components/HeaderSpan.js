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

import { Platform, Dimensions } from 'react-native'
import styled from 'styled-components/native'

export default styled.View`
  background-color: ${props => (props.bgColor ? props.bgColor : '#fff')};
  height: ${props =>
    Platform.OS === 'ios' &&
    Dimensions.get('window').height === 812 &&
    Dimensions.get('window').width === 375
      ? '24px'
      : Platform.OS === 'ios' &&
        Dimensions.get('window').height === 896 &&
        Dimensions.get('window').width === 414
      ? '24px'
      : '0'};
`
