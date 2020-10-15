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
