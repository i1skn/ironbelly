import React, { FunctionComponent } from 'react'
import { Text, TextProps, View } from 'react-native'
import {
  slightlyTransparent,
  styleSheetFactory,
  useThemedStyles,
} from 'src/themes'
const themedStyles = styleSheetFactory((theme) => ({
  container: {
    backgroundColor: theme.surface,
    marginTop: 16,
    borderRadius: 8,
  },
  text: {
    padding: 8,
    fontSize: 16,
    lineHeight: 24,
    color: slightlyTransparent(theme.onSurface),
    textAlign: 'center',
  },
}))

const Notice: FunctionComponent<TextProps> = ({ children }) => {
  const [styles] = useThemedStyles(themedStyles)
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{children}</Text>
    </View>
  )
}

export default Notice
