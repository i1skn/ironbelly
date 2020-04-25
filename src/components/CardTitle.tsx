import React from 'react'
import { TouchableOpacity, StatusBar, StyleSheet, Text, View } from 'react-native'
import FeatherIcon from 'react-native-vector-icons/Feather'
import { isAndroid } from 'src/common'

type Props = {
  title: string
  navigation: any
}

const styles = StyleSheet.create({
  cardTitle: {
    paddingVertical: 16,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  chevron: {
    position: 'absolute',
    padding: 16,
    top: 0,
    left: 0,
    // backgroundColor: 'red',
  },
  title: {
    fontSize: 18,
  },
})

export default ({ title, navigation }: Props) => {
  if (isAndroid) {
    return null
  }
  return (
    <>
      <StatusBar barStyle={'light-content'} />
      <View style={styles.cardTitle}>
        <TouchableOpacity
          style={styles.chevron}
          onPress={() => {
            navigation.goBack()
          }}>
          <FeatherIcon name="chevron-down" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>
    </>
  )
}
