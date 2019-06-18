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

import React, { Component } from 'react'
import { FlatList } from 'react-native'
import { connect } from 'react-redux'
import { Text } from 'components/CustomFont'
import styled from 'styled-components/native'
import { type State as ReduxState, type Currency } from 'common/types'
import { currencyList } from 'common'
import colors from 'common/colors'
import Icon from 'react-native-vector-icons/Ionicons'
import { ListItemSeparator } from 'common'
import { SearchBar } from 'react-native-elements'
import { type State as CurrencyRatesState } from 'modules/currency-rates'

type Props = {
  currency: Currency,
  requestCurrencyRates: () => void,
  setCurrency: (currency: Currency) => void,
  currencyRates: CurrencyRatesState,
}

type State = {
  searchText: string,
  filteredList: Array<Currency>,
}

const Wrapper = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 10px 48px 10px;
`

const Value = styled(Text)`
  padding-right: 16px;
  line-height: 26px;
  color: ${colors.grey[900]};
`

const CheckedIcon = styled(Icon)`
  color: ${colors.success};
  padding-right: 16px;
  margin-left: -26px;
  width: 26px;
`

const ListItem = ({ checked, value, onPress }) => {
  return (
    <Wrapper onPress={onPress}>
      {checked && <CheckedIcon name="ios-checkmark" size={24} />}
      <Value>{value}</Value>
    </Wrapper>
  )
}

const CoinGecko = styled(Text)`
  font-size: 16px;
  color: ${colors.grey[500]};
  text-align: center;
  padding-bottom: 16px;
  padding-top: 16px;
`

class CurrencyList extends Component<Props, State> {
  state = {
    searchText: '',
    filteredList: currencyList,
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Currency',
    }
  }

  componentDidMount() {}

  onSearch = (searchText: string) => {
    const filteredList = currencyList.filter(currency => {
      return currency.code.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
    })
    this.setState({ searchText, filteredList })
  }

  renderHeader = () => {
    return (
      <SearchBar
        placeholder="Search"
        platform="ios"
        containerStyle={{ backgroundColor: colors.white }}
        cancelButtonProps={{
          buttonTextStyle: { color: colors.grey[900] },
        }}
        round
        onChangeText={this.onSearch}
        value={this.state.searchText}
        autoCorrect={false}
      />
    )
  }

  render() {
    const { currency, setCurrency, currencyRates } = this.props
    return (
      <>
        <FlatList
          ListHeaderComponent={this.renderHeader}
          contentContainerStyle={{}}
          ItemSeparatorComponent={ListItemSeparator}
          data={this.state.filteredList}
          keyExtractor={item => item.code}
          keyboardShouldPersistTaps={'handled'}
          onRefresh={() => this.props.requestCurrencyRates()}
          renderItem={({ item }: { item: Currency }) => (
            <ListItem
              checked={currency.code === item.code}
              value={item.code.toUpperCase()}
              onPress={() => setCurrency(item)}
            />
          )}
          refreshing={currencyRates.inProgress}
        />
        <CoinGecko>Data from CoinGecko</CoinGecko>
      </>
    )
  }
}

const mapStateToProps = (state: ReduxState) => ({
  currency: state.settings.currencyObject,
  currencyRates: state.currencyRates,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setCurrency: currencyObject => {
    dispatch({ type: 'SET_SETTINGS', newSettings: { currencyObject } })
  },
  requestCurrencyRates: () =>
    dispatch({
      type: 'CURRENCY_RATES_REQUEST',
    }),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CurrencyList)
