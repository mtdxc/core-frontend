import React, { useContext, useMemo, useEffect, useCallback } from 'react'
import { withRouter } from 'react-router-dom'
import cx from 'classnames'
import { CoreHelmet } from '$shared/components/Helmet'
import CoreLayout from '$shared/components/Layout/Core'
import coreLayoutStyles from '$shared/components/Layout/core.pcss'
import * as UndoContext from '$shared/contexts/Undo'
import Toolbar from '$shared/components/Toolbar'
import type { Product } from '$mp/types/product-types'
import { isDataUnionProduct } from '$mp/utils/product'
import usePending from '$shared/hooks/usePending'
import { productStates } from '$shared/utils/constants'
import { isEthereumAddress } from '$mp/utils/validate'
import useDataUnionSecrets from '$mp/modules/dataUnion/hooks/useDataUnionSecrets'
import ResourceNotFoundError, { ResourceType } from '$shared/errors/ResourceNotFoundError'
import useWhitelist from '$mp/modules/contractProduct/hooks/useWhitelist'
import useModal from '$shared/hooks/useModal'
import useEditableState from '$shared/contexts/Undo/useEditableState'
import { getChainIdFromApiString } from '$shared/utils/chains'
import SwitchNetworkModal from '$shared/components/SwitchNetworkModal'
import BackButton from '$shared/components/BackButton'
import useProductPermissions from '../ProductController/useProductPermissions'
import ProductController, { useController } from '../ProductController'
import useEditableProductActions from '../ProductController/useEditableProductActions'
import { Provider as EditControllerProvider, Context as EditControllerContext } from './EditControllerProvider'
import Editor from './Editor'
import Preview from './Preview'
import ConfirmSaveModal from './ConfirmSaveModal'
import DeployDataUnionModal from './DeployDataUnionModal'
import PublishModal from './PublishModal'
import CropImageModal from './CropImageModal'
import WhitelistEditModal from './WhitelistEditModal'
import styles from './editProductPage.pcss'
import usePendingChanges, { PublishMode } from './usePendingChanges'

const EditProductPage = ({ product }: { product: Product }) => {
    const { isPreview, setIsPreview, save, publish, deployDataUnion, back, validate } = useContext(EditControllerContext)
    const { isPending: savePending } = usePending('product.SAVE')
    const { isPending: publishDialogLoading } = usePending('product.PUBLISH_DIALOG_LOAD')
    const { isPending: fetchingAllStreams } = usePending('product.LOAD_ALL_STREAMS')
    const { product: originalProduct, loadCategories, loadDataUnion, loadDataUnionStats, loadAllStreams, resetDataUnion } = useController()
    const chainId = getChainIdFromApiString(product.chain)
    const { reset: resetDataUnionSecrets } = useDataUnionSecrets()
    const { updateBeneficiaryAddress } = useEditableProductActions()
    const { nextMode } = usePendingChanges()
    const { load: loadWhiteWhitelistedAdresses, reset: resetWhiteWhitelistedAdresses } = useWhitelist()
    const { isOpen: isDataUnionDeployDialogOpen } = useModal('dataUnion.DEPLOY')
    const { isOpen: isConfirmSaveDialogOpen } = useModal('confirmSave')
    const { isOpen: isPublishDialogOpen } = useModal('publish')
    const productId = product.id

    // Load categories and streams
    useEffect(() => {
        if (productId && chainId) {
            loadWhiteWhitelistedAdresses(productId, chainId)
        }

        loadCategories()
        loadAllStreams()
    }, [loadCategories, productId, loadAllStreams, loadWhiteWhitelistedAdresses, chainId])

    const { beneficiaryAddress } = originalProduct
    const isDataUnion = isDataUnionProduct(product)
    // TODO: should really check for the contract existance here
    const isDeployed = isDataUnion && isEthereumAddress(product.beneficiaryAddress)
    const isLoading = savePending || publishDialogLoading
    const modalsOpen = !!(isDataUnionDeployDialogOpen || isConfirmSaveDialogOpen || isPublishDialogOpen)
    const isDisabled = isLoading || modalsOpen
    useEffect(() => {
        if (isDataUnion && isEthereumAddress(beneficiaryAddress)) {
            loadDataUnion(beneficiaryAddress, chainId)
            loadDataUnionStats(beneficiaryAddress, chainId)
        }
    }, [isDataUnion, beneficiaryAddress, loadDataUnion, loadDataUnionStats, chainId])
    // clear streams & data union secrets when unmounting
    useEffect(
        () => () => {
            resetDataUnion()
            resetDataUnionSecrets(beneficiaryAddress)
        },
        [resetDataUnion, resetDataUnionSecrets, beneficiaryAddress],
    )
    // clear whitelisted addresses when unmounting
    useEffect(
        () => () => {
            if (productId) {
                resetWhiteWhitelistedAdresses(productId)
            }
        },
        [resetWhiteWhitelistedAdresses, productId],
    )
    const saveAndExitButton = useMemo(
        () => ({
            title: 'Save & Exit',
            kind: 'link',
            onClick: () => save(),
            disabled: isDisabled,
        }),
        [save, isDisabled],
    )
    const previewButton = useMemo(() => {
        if (isPreview) {
            return {
                title: 'Edit',
                outline: true,
                onClick: () => setIsPreview(false),
                disabled: isDisabled,
            }
        }

        return {
            title: 'Preview',
            outline: true,
            onClick: () => setIsPreview(true),
            disabled: isDisabled,
        }
    }, [isPreview, setIsPreview, isDisabled])
    const productState = product.state
    const publishButton = useMemo(() => {
        const titles = {
            [PublishMode.PUBLISH]: 'Publish',
            [PublishMode.UNPUBLISH]: 'Unpublish',
            [PublishMode.REPUBLISH]: 'Publish',
            [PublishMode.REDEPLOY]: 'Publish',
            [PublishMode.ERROR]: 'Continue',
        }

        let title = 'Continue'

        if (productState === productStates.DEPLOYING) {
            title = 'Publishing'
        } else if (productState === productStates.UNDEPLOYING) {
            title = 'Unpublishing'
        } else if (nextMode != null) {
            title = titles[nextMode]
        }

        return {
            title: title,
            kind: 'primary',
            onClick: publish,
            disabled: !(productState === productStates.NOT_DEPLOYED || productState === productStates.DEPLOYED) || isDisabled,
        }
    }, [productState, publish, isDisabled, nextMode])
    const deployOrSetContract = useCallback(() => {
        const existingAddr = product.existingDUAddress
        if (existingAddr) {
            // Update beneficiary after validate succeeds so that
            // user does not end up in a situation where contract
            // cannot be updated anymore
            if (validate()) {
                const previousBeneficiary = product.beneficiaryAddress
                updateBeneficiaryAddress(existingAddr)

                // Need to validate again to check DU member count
                if (validate()) {
                    return
                } else {
                    // Rollback change
                    updateBeneficiaryAddress(previousBeneficiary)
                }
            }
        } else {
            deployDataUnion()
        }
    }, [product, deployDataUnion, validate, updateBeneficiaryAddress])
    const deployButton = useMemo(() => {
        if (isDataUnion && !isDeployed) {
            return {
                title: 'Continue',
                kind: 'primary',
                onClick: deployOrSetContract,
                disabled: isDisabled,
            }
        }

        return publishButton
    }, [isDataUnion, isDeployed, deployOrSetContract, isDisabled, publishButton])
    const actions = {
        saveAndExit: saveAndExitButton,
        preview: previewButton,
        publish: deployButton,
    }
    const toolbarMiddle = useMemo(() => {
        if (isPreview) {
            return <span className={styles.toolbarMiddle}>This is a preview of how your product will appear when published</span>
        }

        return undefined
    }, [isPreview])
    return (
        <CoreLayout
            className={styles.layout}
            nav={false}
            navComponent={
                <Toolbar
                    left={<BackButton onBack={back} />}
                    middle={toolbarMiddle}
                    actions={actions}
                    altMobileLayout
                    loading={isLoading || (isPreview && fetchingAllStreams)}
                />
            }
            contentClassname={cx({
                [coreLayoutStyles.pad]: !isPreview,
                [styles.editorContent]: !isPreview,
                [styles.previewContent]: !!isPreview,
            })}
        >
            <CoreHelmet title={product.name} />
            {isPreview && <Preview />}
            {!isPreview && <Editor disabled={isDisabled} />}
            <ConfirmSaveModal />
            <DeployDataUnionModal />
            <PublishModal />
            <CropImageModal />
            <WhitelistEditModal />
        </CoreLayout>
    )
}

const LoadingView = () => <CoreLayout className={styles.layout} nav={false} navComponent={<Toolbar loading actions={{}} altMobileLayout />} />

const EditWrap = () => {
    const { state: product } = useEditableState()
    const { isPending: isLoadPending } = usePending('product.LOAD')
    const { isPending: isPermissionsPending } = usePending('product.PERMISSIONS')
    const { hasPermissions, edit } = useProductPermissions()
    const canEdit = !!edit

    if (hasPermissions && !isPermissionsPending && !canEdit) {
        throw new ResourceNotFoundError(ResourceType.PRODUCT, product.id)
    }

    if (!product || isLoadPending || isPermissionsPending || !hasPermissions || !canEdit) {
        return <LoadingView />
    }

    const key = (!!product && product.id) || ''
    return (
        <EditControllerProvider product={product}>
            <EditProductPage key={key} product={product} />
            <SwitchNetworkModal />
        </EditControllerProvider>
    )
}

const ProductContainer = withRouter((props) => (
    <UndoContext.Provider key={props.match.params.id}>
        <ProductController>
            <EditWrap />
        </ProductController>
    </UndoContext.Provider>
))
export default ProductContainer
