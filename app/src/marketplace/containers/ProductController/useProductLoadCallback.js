// @flow

import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import useIsMounted from '$shared/hooks/useIsMounted'
import usePending from '$shared/hooks/usePending'
import { handleLoadError } from '$auth/utils/loginInterceptor'

import type { ProductId } from '$mp/flowtype/product-types'
import { getProductById } from '$mp/modules/product/services'
import { getProductByIdRequest, getProductByIdSuccess } from '$mp/modules/product/actions'
import { isPaidProduct, isDataUnionProduct } from '$mp/utils/product'
import { timeUnits, DEFAULT_CURRENCY } from '$shared/utils/constants'
import { priceForTimeUnits } from '$mp/utils/price'
import { isEthereumAddress } from '$mp/utils/validate'
import { getAdminFee } from '$mp/modules/communityProduct/services'
import { handleEntities } from '$shared/utils/entities'
import { productSchema } from '$shared/modules/entities/schema'

import * as State from '../EditProductPage/state'
import useEditableProductUpdater from './useEditableProductUpdater'

export default function useProductLoadCallback() {
    const productUpdater = useEditableProductUpdater()
    const { wrap } = usePending('product.LOAD')
    const isMounted = useIsMounted()
    const dispatch = useDispatch()

    return useCallback(async (productId: ProductId) => (
        wrap(async () => {
            dispatch(getProductByIdRequest(productId))
            let product
            try {
                product = await getProductById(productId)
            } catch (err) {
                if (!isMounted()) { return }
                await handleLoadError(err)

                throw err
            }
            if (!isMounted()) { return }

            // fetch admin fee from community contract
            let currentAdminFee
            let communityDeployed = false
            if (isDataUnionProduct(product) && isEthereumAddress(product.beneficiaryAddress)) {
                try {
                    currentAdminFee = await getAdminFee(product.beneficiaryAddress)
                    communityDeployed = true
                } catch (e) {
                    // ignore error, assume contract has not been deployed
                }
            }
            if (!isMounted()) { return }

            const nextProduct = {
                ...product,
                isFree: !!product.isFree || !isPaidProduct(product),
                timeUnit: product.timeUnit || timeUnits.hour,
                currency: product.priceCurrency || DEFAULT_CURRENCY,
                price: product.price || priceForTimeUnits(product.pricePerSecond || '0', 1, timeUnits.hour),
                adminFee: currentAdminFee,
                communityDeployed,
            }

            // update redux state, keep original product in redux
            // Set pending changes to empty to prevent merging with previous values
            const result = handleEntities(productSchema, dispatch)({
                ...nextProduct,
                pendingChanges: null,
            })
            dispatch(getProductByIdSuccess(result))

            productUpdater.replaceProduct(() => State.withPendingChanges(nextProduct))
        })
    ), [wrap, dispatch, productUpdater, isMounted])
}
