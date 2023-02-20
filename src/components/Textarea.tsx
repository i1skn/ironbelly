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
import ReactNative, { TextInputProps, View, ViewProps } from 'react-native'
import { TextInput, Text } from 'src/components/CustomFont'
import { styleSheetFactory, useThemedStyles } from 'src/themes'
type Props = TextInputProps & {
  title?: string;
  getRef?: (instance: ReactNative.TextInput | null) => void;
  containerStyle?: ViewProps['style'];
};

function Textarea(props: Props) {
  const [styles] = useThemedStyles(themedStyles)
  const { title, getRef, containerStyle, style, ...passProps } = props
  return (
    <View style={containerStyle}>
      {title && <Text style={styles.title}>{title}</Text>}
      <TextInput
        style={[styles.input, style]}
        multiline={true}
        ref={getRef}
        {...passProps}
      />
    </View>
  )
}

const themedStyles = styleSheetFactory(theme => ({
  input: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: theme.surface,
    color: theme.onSurface,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '400',
    flex: 1,
  },
  title: {
    fontWeight: 500,
    fontSize: 16,
    marginBottom: 8,
  },
}))

export default Textarea
