import React, { useCallback } from 'react'
import {
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ViewProps,
} from 'react-native'
import FeatherIcon from 'react-native-vector-icons/Feather'
import { isAndroid } from 'src/common'
import { useFocusEffect } from '@react-navigation/native'
import colors from 'src/common/colors'

type Props = {
  title: string
  subTitle?: string
  navigation: any
  style?: ViewProps['style']
}

const styles = StyleSheet.create({
  cardTitle: {
    paddingVertical: 16,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  container: {
    flexDirection: 'column',
  },
  chevron: {
    position: 'absolute',
    paddingLeft: 16,
    top: 0,
    left: 0,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  subTitle: {
    fontSize: 14,
    textAlign: 'center',
    color: colors.grey[700],
  },
})

export default ({ title, subTitle, navigation, style }: Props) => {
  if (isAndroid) {
    return null
  }

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content')
      return () => {
        StatusBar.setBarStyle('dark-content')
      }
    }, []),
  )

  return (
    <View style={style}>
      <View style={styles.cardTitle}>
        <TouchableOpacity
          style={[styles.chevron, { paddingTop: (subTitle && 24) || 16 }]}
          onPress={() => {
            navigation.goBack()
          }}>
          <FeatherIcon name="chevron-down" size={24} />
        </TouchableOpacity>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          {subTitle && <Text style={styles.subTitle}>{subTitle}</Text>}
        </View>
      </View>
    </View>
  )
}
