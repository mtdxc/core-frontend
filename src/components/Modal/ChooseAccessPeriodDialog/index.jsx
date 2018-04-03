// @flow

import React from 'react'
import { Form, FormGroup, Input, Label, Row, Col } from '@streamr/streamr-layout'

import { toSeconds } from '../../../utils/helper'
import { priceUnits } from '../../../utils/constants'
import type { Product } from '../../../flowtype/product-types'
import type { PriceUnit } from '../../../flowtype/common-types'
import Dialog from '../Dialog'

export type Props = {
    product: Product,
    onNext: (time: number, timeUnit: PriceUnit) => void,
}

type State = {
    time: number,
    timeUnit: PriceUnit,
}

class ChooseAccessPeriod extends React.Component<Props, State> {
    state = {
        time: 1,
        timeUnit: 'second',
    }

    render() {
        const { product, onNext } = this.props
        const { time, timeUnit } = this.state

        return (
            <Dialog
                title="Choose your access period"
                actions={{
                    next: {
                        title: 'Next',
                        onClick: () => onNext(time, timeUnit),
                        disabled: Number.isNaN(time),
                    },
                }}
            >
                <Form>
                    <FormGroup row>
                        <Label for="time" sm={2}>Time</Label>
                        <Col sm={10}>
                            <Input
                                type="number"
                                name="time"
                                id="time"
                                min={1}
                                value={!Number.isNaN(time) ? time : ''}
                                onChange={(e: SyntheticInputEvent<EventTarget>) => this.setState({
                                    time: parseInt(e.target.value, 10),
                                })}
                                onBlur={(e: SyntheticInputEvent<EventTarget>) => {
                                    if (parseInt(e.target.value, 10) <= 1) {
                                        this.setState({
                                            time: 1,
                                        })
                                    }
                                }}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup row>
                        <Label for="timeUnit" sm={2}>Time unit</Label>
                        <Col sm={10}>
                            <Input
                                type="select"
                                name="timeUnit"
                                id="timeUnit"
                                value={timeUnit}
                                onChange={(e: SyntheticInputEvent<EventTarget>) => this.setState({
                                    timeUnit: (((e.target.value): any): PriceUnit),
                                })}
                            >
                                {priceUnits.map((unit) => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </Input>
                        </Col>
                    </FormGroup>
                    <Row>
                        <Col sm={{
                            size: 4,
                            offset: 2,
                        }}
                        >
                            {!Number.isNaN(time) ? toSeconds(time, timeUnit) * product.pricePerSecond : '-'} DATA
                        </Col>
                        <Col sm={6}>
                            X USD
                        </Col>
                    </Row>
                </Form>
            </Dialog>
        )
    }
}

export default ChooseAccessPeriod
