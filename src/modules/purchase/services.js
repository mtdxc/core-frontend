// @flow

import { getContract, send } from '../../utils/smartContract'
import getConfig from '../../web3/config'

import type { ProductId } from '../../flowtype/product-types'
import type { SmartContractTransaction } from '../../flowtype/web3-types'

const contractMethods = () => getContract(getConfig().marketplace).methods

export const buyProduct = (id: ProductId, subscriptionInSeconds: number): SmartContractTransaction => (
    send(contractMethods().buy(`0x${id}`, subscriptionInSeconds))
)
