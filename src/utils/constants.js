// @flow

import type { PriceUnit } from '../flowtype/common-types'

// The order of these must be the same than in the smart contract
export const currencies = {
    DATA: 'DATA',
    USD: 'USD',
}

// The order of these must be the same than in the smart contract
export const productStates = {
    NOT_DEPLOYED: 'NOT_DEPLOYED',
    DEPLOYED: 'DEPLOYED',
    DEPLOYING: 'DEPLOYING',
    UNDEPLOYING: 'UNDEPLOYING',
}

export const ethereumNetworks: $ReadOnly<{}> = {
    '1': 'Main',
    '3': 'Ropsten',
    '4': 'Rinkeby',
}

// Purchase flow states
export const purchaseFlowSteps = {
    ACCESS_PERIOD: 'accessPeriod',
    ALLOWANCE: 'allowance',
    SUMMARY: 'summary',
    COMPLETE: 'complete',
}

export const priceUnits: Array<PriceUnit> = [
    'second',
    'minute',
    'hour',
    'day',
    'week',
    'month',
]
