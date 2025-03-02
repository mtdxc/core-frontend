import { createAction } from 'redux-actions'
import type { ErrorInUi } from '$shared/types/common-types'
import { getMyPurchases } from '../myPurchaseList/actions'
import type { ProductId, Subscription } from '../../types/product-types'
import {
    GET_PRODUCT_SUBSCRIPTION_FROM_CONTRACT_REQUEST,
    GET_PRODUCT_SUBSCRIPTION_FROM_CONTRACT_SUCCESS,
    GET_PRODUCT_SUBSCRIPTION_FROM_CONTRACT_FAILURE,
} from './constants'
import * as services from './services'
import type { ProductIdActionCreator, ProductErrorActionCreator, ProductSubscriptionActionCreator } from './types'
const getProductSubscriptionFromContractRequest: ProductIdActionCreator = createAction(
    GET_PRODUCT_SUBSCRIPTION_FROM_CONTRACT_REQUEST,
    (id: ProductId) => ({
        id,
    }),
)
const getProductSubscriptionFromContractSuccess: ProductSubscriptionActionCreator = createAction(
    GET_PRODUCT_SUBSCRIPTION_FROM_CONTRACT_SUCCESS,
    (id: ProductId, subscription: Subscription) => ({
        id,
        subscription,
    }),
)
const getProductSubscriptionFromContractFailure: ProductErrorActionCreator = createAction(
    GET_PRODUCT_SUBSCRIPTION_FROM_CONTRACT_FAILURE,
    (id: ProductId, error: ErrorInUi) => ({
        id,
        error,
    }),
)
export const getProductSubscription = (id: ProductId, chainId: number) => (dispatch: (...args: Array<any>) => any): Promise<void> => {
    dispatch(getProductSubscriptionFromContractRequest(id))
    return dispatch(getMyPurchases()).then(() =>
        services.getMyProductSubscription(id, chainId).then(
            (result) => dispatch(getProductSubscriptionFromContractSuccess(id, result)),
            (error) =>
                dispatch(
                    getProductSubscriptionFromContractFailure(id, {
                        message: error.message,
                    }),
                ),
        ),
    )
}
