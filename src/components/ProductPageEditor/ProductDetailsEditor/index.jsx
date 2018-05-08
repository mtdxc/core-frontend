// @flow

import React from 'react'
import BN from 'bignumber.js'
import { Button, Input, DropdownItem } from '@streamr/streamr-layout'
import PaymentRate from '../../PaymentRate'
import { DEFAULT_CURRENCY, timeUnits } from '../../../utils/constants'
import { priceForTimeUnits, pricePerSecondFromTimeUnit } from '../../../utils/price'
import type { Product } from '../../../flowtype/product-types'
import type { Address } from '../../../flowtype/web3-types'
import type { Currency, NumberString, PropertySetter } from '../../../flowtype/common-types'
import type { PriceDialogProps, PriceDialogResult } from '../../Modal/SetPriceDialog'
import type { Category, CategoryList } from '../../../flowtype/category-types'
import type { PriceDialogValidator } from '../../../validators'

import Dropdown from './Dropdown'
import styles from './ProductDetailsEditor.pcss'

type Props = {
    product: Product,
    category: ?Category,
    onEdit: PropertySetter<string | number>,
    ownerAddress: ?Address,
    openPriceDialog: (PriceDialogProps) => void,
    validatePriceDialog: PriceDialogValidator,
    categories: CategoryList,
    isPriceEditable: boolean,
}

type State = {
    category: ?Category,
    pricePerSecond: ?NumberString,
    beneficiaryAddress: ?Address,
    ownerAddress: ?Address,
    priceCurrency: ?Currency,
}

class ProductDetailsEditor extends React.Component<Props, State> {
    state = {
        category: undefined,
        pricePerSecond: null,
        beneficiaryAddress: null,
        ownerAddress: null,
        priceCurrency: null,
    }

    componentWillMount() {
        const { category, product: { pricePerSecond, beneficiaryAddress, ownerAddress, priceCurrency } } = this.props

        this.setState({
            category,
            pricePerSecond,
            beneficiaryAddress,
            ownerAddress: ownerAddress || this.props.ownerAddress,
            priceCurrency: priceCurrency || DEFAULT_CURRENCY,
        })
    }

    componentDidMount() {
        if (this.title) {
            this.title.focus()
        }
    }

    componentWillReceiveProps({ category, ownerAddress }: Props) {
        this.setState({
            category,
            ownerAddress: this.state.ownerAddress || ownerAddress,
        })
    }

    onPriceDialogResult = ({
        amount,
        timeUnit,
        beneficiaryAddress,
        ownerAddress,
        priceCurrency,
    }: PriceDialogResult) => {
        const { onEdit } = this.props

        const pricePerSecond = pricePerSecondFromTimeUnit(amount || BN(0), timeUnit).toString()

        this.setState({
            pricePerSecond,
            beneficiaryAddress,
            ownerAddress,
            priceCurrency,
        })

        onEdit('beneficiaryAddress', beneficiaryAddress || '')
        onEdit('pricePerSecond', pricePerSecond)
        onEdit('priceCurrency', priceCurrency)
        onEdit('ownerAddress', ownerAddress || '')
    }

    onOpenPriceDialogClick = (e: SyntheticInputEvent<EventTarget>) => {
        const { openPriceDialog, validatePriceDialog } = this.props
        const { pricePerSecond, beneficiaryAddress, ownerAddress, priceCurrency } = this.state
        e.preventDefault()

        return openPriceDialog({
            pricePerSecond,
            startingAmount: priceForTimeUnits(pricePerSecond || '0', 1, timeUnits.hour).toString(),
            currency: priceCurrency || DEFAULT_CURRENCY,
            beneficiaryAddress,
            ownerAddress,
            onResult: this.onPriceDialogResult,
            validatePriceDialog,
        })
    }

    onChangeCategory = (category: Category) => {
        this.setState({
            category,
        })
        this.props.onEdit('category', category.id)
    }

    title: ?HTMLImageElement
    assignTitleRef = (ref: ?HTMLImageElement) => {
        this.title = ref
    }

    render() {
        const { product, onEdit, categories, isPriceEditable } = this.props
        const { category } = this.state

        return (
            <div className={styles.details}>
                <Input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Name your product"
                    defaultValue={product.name}
                    innerRef={(innerRef) => {
                        this.title = innerRef
                    }}
                    className={styles.titleField}
                    onChange={(e: SyntheticInputEvent<EventTarget>) => onEdit('name', e.target.value)}
                />
                <span>by {product.owner}</span>
                <span className={styles.separator}>|</span>
                <span>{product.isFree ? 'Free' : <PaymentRate
                    className={styles.paymentRate}
                    amount={product.pricePerSecond}
                    currency={product.priceCurrency}
                    timeUnit={timeUnits.hour}
                    maxDigits={4}
                />}
                </span>
                {isPriceEditable && (<a className={styles.editPrice} href="#" onClick={(e) => this.onOpenPriceDialogClick(e)}> Edit price </a>)}
                <Input
                    type="textarea"
                    name="description"
                    id="description"
                    placeholder="Write a brief description"
                    className={styles.productDescription}
                    defaultValue={product.description}
                    onChange={(e: SyntheticInputEvent<EventTarget>) => onEdit('description', e.target.value)}
                />
                <Dropdown
                    type="text"
                    name="description"
                    id="description"
                    placeholder="description"
                    className={styles.dropdown}
                    title={
                        <span>{category ? category.name : 'Set a product category'} &#9662;</span>
                    }
                >
                    {categories.map((c) => (
                        <DropdownItem
                            key={c.id}
                            onClick={() => this.onChangeCategory(c)}
                        >
                            {c.name}
                        </DropdownItem>
                    ))}
                </Dropdown>
                <Button color="primary" disabled>
                    Purchase
                </Button>
            </div>
        )
    }
}

export default ProductDetailsEditor
