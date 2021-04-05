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

import React from 'react'
import { Text, TextInput } from 'src/components/CustomFont'
import { StyleProp, TextStyle, View } from 'react-native'
import { styleSheetFactory, useThemedStyles } from 'src/themes'
type Props = {
  units?: string
  placeholder?: string
  maxLength: number
  value: string
  onChange: (value: string) => void
  autoFocus: boolean
  style?: StyleProp<TextStyle>
}

function NumericInput(props: Props) {
  const [styles] = useThemedStyles(themedStyles)
  const {
    units,
    maxLength,
    style,
    onChange,
    value,
    autoFocus,
    placeholder,
  } = props
  return (
    <View style={[styles.layout, style]}>
      {units && <Text style={styles.spacer}>{units}</Text>}
      <TextInput
        style={[styles.input, { fontWeight: value ? '400' : '300' }]}
        autoFocus={autoFocus}
        onChangeText={onChange}
        value={value}
        keyboardType="numeric"
        maxLength={maxLength}
        placeholder={placeholder}
      />
      {units && <Text style={styles.hiddenSpacer}>{units}</Text>}
    </View>
  )
}

const themedStyles = styleSheetFactory((theme) => ({
  layout: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexGrow: 1,
    alignItems: 'center',
  },
  spacer: {
    color: theme.onBackground,
    fontSize: 36,
    height: 58,
    lineHeight: 58,
  },
  hiddenSpacer: {
    color: theme.background,
    fontSize: 36,
    height: 58,
    lineHeight: 58,
  },
  input: {
    fontSize: 36,
    color: theme.onBackground,
    height: 68,
    textAlignVertical: 'center',
  },
}))

export default NumericInput
