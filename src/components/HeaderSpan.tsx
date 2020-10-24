/**
 * Copyright 2019 Ironbelly Devs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Platform, Dimensions } from 'react-native'
import colors from 'src/common/colors'
import styled from 'styled-components/native'

export default styled.View<{ bgColor: string }>`
  background-color: ${(props) =>
    props.bgColor ? props.bgColor : colors.surface};
  height: ${() =>
    Platform.OS === 'ios' &&
    Dimensions.get('window').height === 812 &&
    Dimensions.get('window').width === 375
      ? '32px'
      : Platform.OS === 'ios' &&
        Dimensions.get('window').height === 896 &&
        Dimensions.get('window').width === 414
      ? '32px'
      : '0'};
`
