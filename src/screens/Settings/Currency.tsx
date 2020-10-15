import React, { Component } from 'react'
import FeatherIcon from 'react-native-vector-icons/Feather'
import { FlatList, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'
import { Text } from 'src/components/CustomFont'
import styled from 'styled-components/native'
import { State as ReduxState, Currency } from 'src/common/types'
import { currencyList } from 'src/common'
import colors from 'src/common/colors'
import { SearchBar } from 'react-native-elements'
import { State as CurrencyRatesState } from 'src/modules/currency-rates'
type Props = {
  currency: Currency
  requestCurrencyRates: () => void
  setCurrency: (currency: Currency) => void
  currencyRates: CurrencyRatesState
}
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

const ListItem = ({ checked, value, onPress }) => {
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

  render() {
    const { currency, setCurrency, currencyRates } = this.props
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
              onPress={() => setCurrency(item)}
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

const mapStateToProps = (state: ReduxState) => ({
  currency: state.settings.currencyObject,
  currencyRates: state.currencyRates,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  setCurrency: (currencyObject) => {
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
