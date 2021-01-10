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
import { Button, Text } from 'src/components/CustomFont'
import styled from 'styled-components/native'
import { FlexGrow, hrGrin, LoaderView } from 'src/common'
import colors from 'src/common/colors'
import { connect } from 'react-redux'
import { Dispatch, Tx } from 'src/common/types'
import { RootState } from 'src/common/redux'
import { ActivityIndicator } from 'react-native'
const Wrapper = styled.View`
  background: white;
  min-height: 280px;
  border-radius: 8;
  margin: 16px 8px;
`
const Header = styled.View`
  background: black;
  border-top-right-radius: 8;
  border-top-left-radius: 8;
  height: 56px;
  justify-content: center;
`
const HeaderText = styled(Text)`
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: ${colors.primary};
`
const Body = styled.View`
  padding: 8px;
  flex: 1;
`
const AmountText = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin: 8px 0;
`
const FeeText = styled(Text)`
  font-size: 16px;
  text-align: center;
`
const SuccessText = styled(Text)`
  font-size: 24;
  font-weight: bold;
  text-align: center;
`
const Success = styled.View`
  flex: 1;
  justify-content: center;
`
type Props = {
  // amount: number
  // dest: string
  txSlateId: string | undefined | null
  txGet: (txSlateId: string) => void
  txPost: (txSlateId: string) => void
  close: () => void
  tx: Tx | undefined | null
  inProgress: boolean
  posted: boolean
}

class TxPostConfirmationModal extends Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  componentDidMount() {
    if (this.props.txSlateId) {
      this.props.txGet(this.props.txSlateId)
    }
  }

  render() {
    const { tx, close, txSlateId, txPost, inProgress, posted } = this.props
    return (
      <Wrapper>
        {((inProgress || !tx) && (
          <LoaderView>
            <ActivityIndicator size="large" color={colors.primary} />
          </LoaderView>
        )) ||
          (txSlateId && tx && (
            <React.Fragment>
              <Header>
                <HeaderText>
                  {tx.type === 'TxPosted' ? 'Re-send' : 'Confirm'} transaction
                </HeaderText>
              </Header>
              {(posted && (
                <Success>
                  <SuccessText>
                    Transaction has been posted successfully!
                  </SuccessText>
                </Success>
              )) || (
                <Body>
                  <AmountText>Send {hrGrin(-tx.amount)} </AmountText>
                  <FeeText>Fee: {hrGrin(tx.fee)} </FeeText>
                  <FlexGrow />
                  <Button
                    style={{
                      marginBottom: 8,
                    }}
                    title="Confirm"
                    onPress={() => txPost(txSlateId)}
                  />
                  <Button inverted title="Decline" onPress={() => close()} />
                </Body>
              )}
            </React.Fragment>
          ))}
      </Wrapper>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  txSlateId: state.tx.txPost.txSlateId,
  tx: state.tx.txGet.data,
  inProgress: state.tx.txGet.inProgress || state.tx.txPost.inProgress,
  posted: state.tx.txPost.posted,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  txGet: (txSlateId: string) => {
    dispatch({
      type: 'TX_GET_REQUEST',
      txSlateId,
    })
  },
  txPost: (txSlateId: string) => {
    dispatch({
      type: 'TX_POST_REQUEST',
      txSlateId,
    })
  },
  close: () => {
    dispatch({
      type: 'TX_POST_CLOSE',
    })
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TxPostConfirmationModal)
