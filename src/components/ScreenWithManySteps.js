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
import { Animated, Dimensions } from 'react-native'
import Header from 'components/Header'

import { Spacer, FlexGrow, Wrapper } from 'common'
import { Button } from 'components/CustomFont'
import { type Navigation } from 'common/types'

export type MoveFunc = (delta: number) => void

type Props = {
  steps: Array<any>,
  navigation: Navigation,
  cancelAction: () => void,
  finalAction: () => void,
}

type State = {
  screenWidth: number,
  offsetX: Animated.Value,
  currentStep: number,
  nextStep: number,
}

class ScreenWithManySteps extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      offsetX: new Animated.Value(0),
      screenWidth: Dimensions.get('window').width,
      currentStep: 0,
      nextStep: 0,
    }
  }

  static navigationOptions = {
    header: null,
  }

  move = (delta: number) => {
    const { currentStep, screenWidth } = this.state
    const nextStep = currentStep + delta
    if (nextStep < 0) {
      this.props.cancelAction()
    } else if (nextStep >= this.props.steps.length) {
      this.props.finalAction()
    } else {
      // Proceed to the next step
      this.setState({ nextStep })
      // During transition we show both current and next step
      Animated.timing(this.state.offsetX, {
        toValue: -nextStep * screenWidth,
        duration: 300,
      }).start(() => {
        // After transition finished current and next becoming the same
        this.setState({ currentStep: nextStep })
      })
    }
  }

  render() {
    const { offsetX, screenWidth, currentStep, nextStep } = this.state
    const { steps } = this.props
    const curr = steps[currentStep]
    const next = steps[nextStep]
    return (
      <React.Fragment>
        <Header
          leftIcon={curr.backButtonIcon}
          leftText={curr.backButtonText}
          leftAction={() => this.move(next.backButtonDelta || -1)}
        />
        <Wrapper behavior="padding">
          {/* Steps */}
          <FlexGrow>
            {steps.map((step, i) => {
              const StepContainer = step
              return (
                [currentStep, nextStep].indexOf(i) !== -1 && (
                  <Animated.View
                    key={i}
                    style={{
                      width: '100%',
                      top: 0,
                      position: 'absolute',
                      left: Animated.add(offsetX, screenWidth * i),
                    }}
                  >
                    <StepContainer move={this.move} />
                  </Animated.View>
                )
              )
            })}
          </FlexGrow>
          {!next.nextButtonHide && (
            <Button
              testID="ManyStepsNextButton"
              title={next.nextButtonText}
              onPress={next.nextButtonClick(this.move, this.props.navigation)}
              disabled={next.nextButtonDisabled()}
            />
          )}
          <Spacer />
        </Wrapper>
      </React.Fragment>
    )
  }
}

export default ScreenWithManySteps
