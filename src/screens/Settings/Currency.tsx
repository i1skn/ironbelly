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

import React, { Component } from 'react'
import FeatherIcon from 'react-native-vector-icons/Feather'
import { FlatList, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { Text } from 'src/components/CustomFont'
import styled from 'styled-components/native'
import { Currency, Dispatch, NavigationProps } from 'src/common/types'
import { RootState } from 'src/common/redux'
import { currencyList } from 'src/common'
import colors from 'src/common/colors'
import { SearchBar } from 'react-native-elements'
import { State as CurrencyRatesState } from 'src/modules/currency-rates'
type DispatchProps = {
  currency: Currency
  requestCurrencyRates: () => void
  setCurrency: (currency: Currency) => void
  currencyRates: CurrencyRatesState
}

type Props = NavigationProps<'SettingsCurrency'> & DispatchProps

type State = {
  searchText: string
  filteredList: Array<Currency>
}
const ListItemTouchable = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`

const Value = styled(Text)`
  padding-right: 16px;
  line-height: 26px;
  color: ${colors.grey[900]};
`

type ListItemProps = { checked: boolean; value: string; onPress: () => void }
const ListItem = ({ checked, value, onPress }: ListItemProps) => {
  return (
    <View style={styles.listItem}>
      <ListItemTouchable onPress={onPress}>
        {checked && (
          <FeatherIcon
            style={styles.checkIcon}
            name="chevron-right"
            size={20}
          />
        )}
        <Value>{value}</Value>
      </ListItemTouchable>
    </View>
  )
}

const CoinGecko = styled(Text)`
  font-size: 16px;
  color: ${colors.grey[500]};
  text-align: center;
  padding-vertical: 16px;
  background: ${colors.background};
`

class CurrencyList extends Component<Props, State> {
  state = {
    searchText: '',
    filteredList: currencyList,
  }
  onSearch = (searchText: string) => {
    const filteredList = currencyList.filter((currency) => {
      return (
        currency.code.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
      )
    })
    this.setState({
      searchText,
      filteredList,
    })
  }
  renderHeader = () => {
    return (
      <SearchBar
        placeholder="Search"
        platform="ios"
        containerStyle={{
          paddingHorizontal: 8,
        }}
        inputContainerStyle={{
          backgroundColor: colors.surface,
        }}
        cancelButtonProps={{
          buttonTextStyle: {
            color: colors.onBackground,
            marginRight: 8,
          },
        }}
        round
        onChangeText={this.onSearch}
        value={this.state.searchText}
        autoCorrect={false}
      />
    )
  }

  onChoose = (item: Currency) => {
    return () => {
      this.props.setCurrency(item)
      this.props.navigation.goBack()
    }
  }

  render() {
    const { currency, currencyRates } = this.props
    return (
      <View style={styles.container}>
        <FlatList
          ListHeaderComponent={this.renderHeader}
          ListFooterComponent={<CoinGecko>Data from CoinGecko</CoinGecko>}
          contentContainerStyle={{}}
          data={this.state.filteredList}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps={'handled'}
          onRefresh={() => this.props.requestCurrencyRates()}
          renderItem={({ item }: { item: Currency }) => (
            <ListItem
              checked={currency.code === item.code}
              value={item.code.toUpperCase()}
              onPress={this.onChoose(item)}
            />
          )}
          refreshing={currencyRates.inProgress}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  listItem: {
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingLeft: 44,
    paddingRight: 16,
  },
  checkIcon: {
    color: colors.secondary,
    paddingRight: 16,
    marginLeft: -30,
    width: 30,
  },
})

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

export default connect(mapStateToProps, mapDispatchToProps)(CurrencyList)
