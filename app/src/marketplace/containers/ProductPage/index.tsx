import React, { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import Layout from '$shared/components/Layout'
import { MarketplaceHelmet } from '$shared/components/Helmet'
import type { ProductId } from '$mp/types/product-types'
import usePending from '$shared/hooks/usePending'
import { getProductSubscription } from '$mp/modules/product/actions'
import PrestyledLoadingIndicator from '$shared/components/LoadingIndicator'
import Nav from '$shared/components/Layout/Nav'
import { selectUserData } from '$shared/modules/user/selectors'
import { useSessionToken } from '$shared/reducers/session'
import { getChainIdFromApiString } from '$shared/utils/chains'
import ProductController, { useController } from '../ProductController'
import WhitelistRequestAccessModal from './WhitelistRequestAccessModal'
import PurchaseModal from './PurchaseModal'
import Page from './Page'
const LoadingIndicator = styled(PrestyledLoadingIndicator)`
    top: 2px;
`

const ProductPage = () => {
    const dispatch = useDispatch()
    const { product, loadCategories, loadDataUnion, loadRelatedProducts } = useController()
    const userData = useSelector(selectUserData)
    const token = useSessionToken()
    const isLoggedIn = userData !== null && !!token
    const { isPending } = usePending('contractProduct.LOAD')
    const { id: productId } = useParams()
    const chainId = getChainIdFromApiString(product.chain)
    const loadAdditionalProductData = useCallback(
        async (id: ProductId) => {
            loadCategories()
            loadRelatedProducts(id, isLoggedIn)

            if (isLoggedIn) {
                dispatch(getProductSubscription(id, chainId))
            }
        },
        [dispatch, isLoggedIn, loadCategories, loadRelatedProducts, chainId],
    )
    useEffect(() => {
        loadAdditionalProductData(productId)
    }, [loadAdditionalProductData, productId])
    const { dataUnionDeployed, beneficiaryAddress } = product
    useEffect(() => {
        if (dataUnionDeployed && beneficiaryAddress) {
            loadDataUnion(beneficiaryAddress, chainId)
        }
    }, [dataUnionDeployed, beneficiaryAddress, chainId, loadDataUnion])
    return (
        <Layout nav={<Nav shadow />}>
            <MarketplaceHelmet title={product.name} />
            <LoadingIndicator loading={isPending} />
            <Page />
            <PurchaseModal />
            <WhitelistRequestAccessModal />
        </Layout>
    )
}

const LoadingView = () => (
    <Layout>
        <MarketplaceHelmet />
        <LoadingIndicator loading />
    </Layout>
)

const EditWrap = () => {
    const { product, hasLoaded } = useController()
    const { isPending: loadPending } = usePending('product.LOAD')
    const { isPending: permissionsPending } = usePending('product.PERMISSIONS')

    if (!hasLoaded || loadPending || permissionsPending) {
        return <LoadingView />
    }

    const key = (!!product && product.id) || ''
    return <ProductPage key={key} product={product} />
}

const ProductContainer = () => {
    const { id } = useParams()
    return (
        <ProductController key={id} ignoreUnauthorized requirePublished useAuthorization={false}>
            <EditWrap />
        </ProductController>
    )
}

export default ProductContainer
