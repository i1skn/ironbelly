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

import React, { useState } from 'react'
import FeatherIcon from 'react-native-vector-icons/Feather'
import { FlatList, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import { Text } from 'src/components/CustomFont'
import { Currency, Dispatch, NavigationProps } from 'src/common/types'
import { RootState } from 'src/common/redux'
import { currencyList, isAndroid } from 'src/common'
import { State as CurrencyRatesState } from 'src/modules/currency-rates'
import { SearchBar } from '@rneui/themed'
import {
  slightlyTransparent,
  styleSheetFactory,
  useThemedStyles,
} from 'src/themes'
type DispatchProps = {
  currency: Currency;
  requestCurrencyRates: () => void;
  setCurrency: (currency: Currency) => void;
  currencyRates: CurrencyRatesState;
};

type Props = NavigationProps<'SettingsCurrency'> & DispatchProps;

type ListItemProps = {checked: boolean; value: string; onPress: () => void};

const ListItem = ({ checked, value, onPress }: ListItemProps) => {
  const [styles] = useThemedStyles(themedStyles)
  return (
    <View style={styles.listItem}>
      <TouchableOpacity style={styles.touchable} onPress={onPress}>
        {checked && (
          <FeatherIcon
            style={styles.checkIcon}
            name="chevron-right"
            size={20}
          />
        )}
        <Text style={styles.value}>{value}</Text>
      </TouchableOpacity>
    </View>
  )
}

function CurrencyList(props: Props) {
  const [searchText, setSearchText] = useState('')
  const [filteredList, setFilteredList] = useState(currencyList)

  const onSearch = (newSearchText: string) => {
    setSearchText(newSearchText)
    setFilteredList(
      currencyList.filter(currency => {
        return (
          currency.code.toLowerCase().indexOf(newSearchText.toLowerCase()) !==
          -1
        )
      }),
    )
  }
  const onChoose = (item: Currency) => {
    return () => {
      props.setCurrency(item)
      props.navigation.goBack()
    }
  }

  const { currency, currencyRates } = props
  const [styles] = useThemedStyles(themedStyles)
  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <SearchBar
            placeholder="Search"
            platform={isAndroid ? 'android' : 'ios'}
            containerStyle={styles.searchBar}
            inputContainerStyle={styles.searchBarInput}
            cancelButtonProps={{ buttonTextStyle: styles.cancelButton }}
            round
            onChangeText={onSearch}
            value={searchText}
            autoCorrect={false}
          />
        }
        initialNumToRender={20}
        ListFooterComponent={
          <Text style={styles.coinGecko}>Data from CoinGecko</Text>
        }
        data={filteredList}
        keyExtractor={item => item.code}
        keyboardShouldPersistTaps={'handled'}
        onRefresh={() => props.requestCurrencyRates()}
        renderItem={({ item }: {item: Currency}) => (
          <ListItem
            checked={currency.code === item.code}
            value={item.code.toUpperCase()}
            onPress={onChoose(item)}
          />
        )}
        refreshing={currencyRates.inProgress}
      />
    </View>
  )
}

const mapStateToProps = (state: RootState) => ({
  currency: state.settings.currencyObject,
  currencyRates: state.currencyRates,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setCurrency: (currencyObject: Currency) => {
    dispatch({
      type: 'SET_SETTINGS',
      newSettings: {
        currencyObject,
      },
    })
  },
  requestCurrencyRates: () =>
    dispatch({
      type: 'CURRENCY_RATES_REQUEST',
    }),
})

const themedStyles = styleSheetFactory(theme => ({
  container: {
    flexGrow: 1,
    backgroundColor: theme.background,
  },
  listItem: {
    backgroundColor: theme.surface,
    paddingVertical: 10,
    paddingLeft: 44,
    paddingRight: 16,
  },
  checkIcon: {
    color: theme.secondary,
    paddingRight: 16,
    marginLeft: -30,
    width: 30,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    paddingRight: 16,
    lineHeight: 26,
    color: theme.onBackground,
  },
  coinGecko: {
    fontSize: 16,
    color: slightlyTransparent(theme.onBackground),
    textAlign: 'center',
    paddingVertical: 16,
  },
  searchBar: {
    backgroundColor: theme.surface,
    paddingHorizontal: 8,
  },
  searchBarInput: {
    backgroundColor: theme.background,
  },
  cancelButton: {
    color: theme.onBackground,
    marginRight: 8,
  },
}))

export default connect(mapStateToProps, mapDispatchToProps)(CurrencyList)
