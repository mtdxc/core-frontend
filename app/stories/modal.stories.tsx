import React from 'react'
import StoryRouter from 'storybook-react-router'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import styles from '@sambego/storybook-styles'
import BN from 'bignumber.js'
import { transactionStates, timeUnits } from '$shared/utils/constants'
import { subscribeSnippets } from '$utils/streamSnippets'
import PngIcon from '$shared/components/PngIcon'
import croppedImage from '$mp/assets/product_standard.png'
import { PublishMode } from '$mp/containers/EditProductPage/usePendingChanges'
import { actionsTypes as publishActionTypes } from '$mp/containers/EditProductPage/usePublish'
import { actionsTypes as purchaseActionTypes } from '$mp/containers/ProductPage/usePurchase'
import { actionsTypes as whitelistActionTypes } from '$mp/containers/EditProductPage/useUpdateWhitelist'
// marketplace
import PublishTransactionProgress from '$mp/components/Modal/PublishTransactionProgress'
import PublishComplete from '$mp/components/Modal/PublishComplete'
import PublishError from '$mp/components/Modal/PublishError'
import GuidedDeployDataUnionDialog from '$mp/components/Modal/GuidedDeployDataUnionDialog'
import ConfirmDeployDataUnionDialog from '$mp/components/Modal/ConfirmDeployDataUnionDialog'
import DeployingDataUnionDialog from '$mp/components/Modal/DeployingDataUnionDialog'
import GetDataTokensDialog from '$mp/components/Modal/GetDataTokensDialog'
import GetCryptoDialog from '$mp/components/Modal/GetCryptoDialog'
import InsufficientDataDialog from '$mp/components/Modal/InsufficientDataDialog'
import InsufficientDaiDialog from '$mp/components/Modal/InsufficientDaiDialog'
import InsufficientTokenDialog from '$mp/components/Modal/InsufficientTokenDialog'
import NoBalanceDialog from '$mp/components/Modal/NoBalanceDialog'
import ChooseAccessPeriodDialog from '$mp/components/Modal/ChooseAccessPeriodDialog'
import PurchaseSummaryDialog from '$mp/components/Modal/PurchaseSummaryDialog'
import PurchaseTransactionProgress from '$mp/components/Modal/PurchaseTransactionProgress'
import PurchaseComplete from '$mp/components/Modal/PurchaseComplete'
import PurchaseError from '$mp/components/Modal/PurchaseError'
import ReadyToPublishDialog from '$mp/components/Modal/ReadyToPublishDialog'
import ErrorDialog from '$mp/components/Modal/ErrorDialog'
import CropImageModal from '$mp/components/Modal/CropImageModal'
import AddWhitelistedAddressDialog from '$mp/components/Modal/AddWhitelistedAddressDialog'
import RemoveWhitelistedAddressDialog from '$mp/components/Modal/RemoveWhitelistedAddressDialog'
import WhitelistEditProgressDialog from '$mp/components/Modal/WhitelistEditProgressDialog'
import WhitelistEditErrorDialog from '$mp/components/Modal/WhitelistEditErrorDialog'
import WhitelistRequestAccessDialog from '$mp/components/Modal/WhitelistRequestAccessDialog'
import SwitchWalletAccountDialog from '$mp/components/Modal/SwitchWalletAccountDialog'
// userpages
import SnippetDialog from '$userpages/components/SnippetDialog'
import AvatarUploadDialog from '$userpages/components/ProfilePage/ProfileSettings/EditAvatarDialog/AvatarUploadDialog'
import CropAvatarDialog from '$userpages/components/ProfilePage/ProfileSettings/EditAvatarDialog/CropAvatarDialog'
import { DeleteAccountDialogComponent } from '$userpages/components/ProfilePage/DeleteAccount/DeleteAccountDialog'
// shared
import ConfirmDialog from '$shared/components/ConfirmDialog'
import UnlockWalletDialog from '$shared/components/Web3ErrorDialog/UnlockWalletDialog'
import InstallMetaMaskDialog from '$shared/components/Web3ErrorDialog/Web3NotDetectedDialog/InstallMetaMaskDialog'
import InstallMobileApplicationDialog from '$shared/components/Web3ErrorDialog/Web3NotDetectedDialog/InstallMobileApplicationDialog'
import InstallSupportedBrowserDialog from '$shared/components/Web3ErrorDialog/Web3NotDetectedDialog/InstallSupportedBrowserDialog'
import ConfirmSaveDialog from '$shared/components/ConfirmSaveDialog'
import WrongNetworkSelectedDialog from '$shared/components/WrongNetworkSelectedDialog'

const story = (name) =>
    storiesOf(`Modal/${name}`, module)
        .addDecorator(StoryRouter())
        .addDecorator(
            styles({
                color: '#323232',
                padding: '5rem',
                background: '#F8F8F8',
                fontSize: '16px',
            }),
        )
        .addDecorator((storyFn) => (
            <div>
                <div id="content">{storyFn()}</div>
                <div id="modal-root" />
            </div>
        ))

const options = [
    transactionStates.STARTED,
    transactionStates.PENDING,
    transactionStates.CONFIRMED,
    transactionStates.FAILED,
]
story('Product Editor/PublishTransactionProgress')
    .add('Publish', () => {
        const adminFeeStatus = transactionStates.STARTED
        const updateContractStatus = transactionStates.STARTED
        const createContractStatus = transactionStates.STARTED
        const redeployPaidStatus = transactionStates.STARTED
        const publishFreeStatus = transactionStates.STARTED
        const publishPendingStatus = transactionStates.STARTED
        const statuses = {
            [publishActionTypes.UPDATE_ADMIN_FEE]: adminFeeStatus,
            [publishActionTypes.UPDATE_CONTRACT_PRODUCT]: updateContractStatus,
            [publishActionTypes.CREATE_CONTRACT_PRODUCT]: createContractStatus,
            [publishActionTypes.REDEPLOY_PAID]: redeployPaidStatus,
            [publishActionTypes.PUBLISH_FREE]: publishFreeStatus,
            [publishActionTypes.PUBLISH_PENDING_CHANGES]: publishPendingStatus,
        }
        return (
            <PublishTransactionProgress
                publishMode={PublishMode.PUBLISH}
                onCancel={action('cancel')}
                status={statuses}
                isPrompted={false}
            />
        )
    })
    .add('Republish', () => {
        const adminFeeStatus = transactionStates.STARTED
        const updateContractStatus = transactionStates.STARTED
        const createContractStatus = transactionStates.STARTED
        const redeployPaidStatus = transactionStates.STARTED
        const publishFreeStatus = transactionStates.STARTED
        const publishPendingStatus = transactionStates.STARTED
        const statuses = {
            [publishActionTypes.UPDATE_ADMIN_FEE]: adminFeeStatus,
            [publishActionTypes.UPDATE_CONTRACT_PRODUCT]: updateContractStatus,
            [publishActionTypes.CREATE_CONTRACT_PRODUCT]: createContractStatus,
            [publishActionTypes.REDEPLOY_PAID]: redeployPaidStatus,
            [publishActionTypes.PUBLISH_FREE]: publishFreeStatus,
            [publishActionTypes.PUBLISH_PENDING_CHANGES]: publishPendingStatus,
        }
        return (
            <PublishTransactionProgress
                publishMode={PublishMode.REPUBLISH}
                onCancel={action('cancel')}
                status={statuses}
                isPrompted={false}
            />
        )
    })
    .add('Redeploy', () => {
        const adminFeeStatus = transactionStates.STARTED
        const updateContractStatus = transactionStates.STARTED
        const createContractStatus = transactionStates.STARTED
        const redeployPaidStatus = transactionStates.STARTED
        const publishFreeStatus = transactionStates.STARTED
        const publishPendingStatus = transactionStates.STARTED
        const statuses = {
            [publishActionTypes.UPDATE_ADMIN_FEE]: adminFeeStatus,
            [publishActionTypes.UPDATE_CONTRACT_PRODUCT]: updateContractStatus,
            [publishActionTypes.CREATE_CONTRACT_PRODUCT]: createContractStatus,
            [publishActionTypes.REDEPLOY_PAID]: redeployPaidStatus,
            [publishActionTypes.PUBLISH_FREE]: publishFreeStatus,
            [publishActionTypes.PUBLISH_PENDING_CHANGES]: publishPendingStatus,
        }
        return (
            <PublishTransactionProgress
                publishMode={PublishMode.REDEPLOY}
                onCancel={action('cancel')}
                status={statuses}
                isPrompted={false}
            />
        )
    })
    .add('Unpublish', () => {
        const unpublishFreeStatus = transactionStates.STARTED
        const undeployPaidStatus = transactionStates.STARTED
        const statuses = {
            [publishActionTypes.UNPUBLISH_FREE]: unpublishFreeStatus,
            [publishActionTypes.UNDEPLOY_CONTRACT_PRODUCT]: undeployPaidStatus,
        }
        return (
            <PublishTransactionProgress
                publishMode={PublishMode.UNPUBLISH}
                onCancel={action('cancel')}
                status={statuses}
            />
        )
    })
story('Product Editor/PublishComplete')
    .add('Publish', () => (
        <PublishComplete
            onClose={action('onClose')}
            onContinue={action('onContinue')}
            productId={'1ff644fdb6ba40a287af2e607b131f32aaad9872ddd54e79b1106ff916e12890'}
            publishMode={PublishMode.PUBLISH}
        />
    ))
    .add('Redeploy', () => (
        <PublishComplete
            onClose={action('onClose')}
            onContinue={action('onContinue')}
            productId={'1ff644fdb6ba40a287af2e607b131f32aaad9872ddd54e79b1106ff916e12890'}
            publishMode={PublishMode.REDEPLOY}
        />
    ))
    .add('Republish', () => (
        <PublishComplete
            onClose={action('onClose')}
            onContinue={action('onContinue')}
            productId={'1ff644fdb6ba40a287af2e607b131f32aaad9872ddd54e79b1106ff916e12890'}
            publishMode={PublishMode.REPUBLISH}
        />
    ))
    .add('Unpublish', () => (
        <PublishComplete
            onClose={action('onClose')}
            onContinue={action('onContinue')}
            productId={'1ff644fdb6ba40a287af2e607b131f32aaad9872ddd54e79b1106ff916e12890'}
            publishMode={PublishMode.UNPUBLISH}
        />
    ))
story('Product Editor/PublishError')
    .add('Publish', () => {
        const adminFeeStatus = transactionStates.STARTED
        const updateContractStatus = transactionStates.STARTED
        const createContractStatus = transactionStates.STARTED
        const redeployPaidStatus = transactionStates.STARTED
        const publishFreeStatus = transactionStates.STARTED
        const publishPendingStatus = transactionStates.STARTED
        const statuses = {
            [publishActionTypes.UPDATE_ADMIN_FEE]: adminFeeStatus,
            [publishActionTypes.UPDATE_CONTRACT_PRODUCT]: updateContractStatus,
            [publishActionTypes.CREATE_CONTRACT_PRODUCT]: createContractStatus,
            [publishActionTypes.REDEPLOY_PAID]: redeployPaidStatus,
            [publishActionTypes.PUBLISH_FREE]: publishFreeStatus,
            [publishActionTypes.PUBLISH_PENDING_CHANGES]: publishPendingStatus,
        }
        return <PublishError onClose={action('onClose')} status={statuses} publishMode={PublishMode.PUBLISH} />
    })
    .add('Republish', () => {
        const adminFeeStatus = transactionStates.STARTED
        const updateContractStatus = transactionStates.STARTED
        const createContractStatus = transactionStates.STARTED
        const redeployPaidStatus = transactionStates.STARTED
        const publishFreeStatus = transactionStates.STARTED
        const publishPendingStatus = transactionStates.STARTED
        const statuses = {
            [publishActionTypes.UPDATE_ADMIN_FEE]: adminFeeStatus,
            [publishActionTypes.UPDATE_CONTRACT_PRODUCT]: updateContractStatus,
            [publishActionTypes.CREATE_CONTRACT_PRODUCT]: createContractStatus,
            [publishActionTypes.REDEPLOY_PAID]: redeployPaidStatus,
            [publishActionTypes.PUBLISH_FREE]: publishFreeStatus,
            [publishActionTypes.PUBLISH_PENDING_CHANGES]: publishPendingStatus,
        }
        return <PublishError onClose={action('onClose')} status={statuses} publishMode={PublishMode.REPUBLISH} />
    })
    .add('Redeploy', () => {
        const adminFeeStatus = transactionStates.STARTED
        const updateContractStatus = transactionStates.STARTED
        const createContractStatus = transactionStates.STARTED
        const redeployPaidStatus = transactionStates.STARTED
        const publishFreeStatus = transactionStates.STARTED
        const publishPendingStatus = transactionStates.STARTED
        const statuses = {
            [publishActionTypes.UPDATE_ADMIN_FEE]: adminFeeStatus,
            [publishActionTypes.UPDATE_CONTRACT_PRODUCT]: updateContractStatus,
            [publishActionTypes.CREATE_CONTRACT_PRODUCT]: createContractStatus,
            [publishActionTypes.REDEPLOY_PAID]: redeployPaidStatus,
            [publishActionTypes.PUBLISH_FREE]: publishFreeStatus,
            [publishActionTypes.PUBLISH_PENDING_CHANGES]: publishPendingStatus,
        }
        return <PublishError onClose={action('onClose')} status={statuses} publishMode={PublishMode.REDEPLOY} />
    })
    .add('Unpublish', () => {
        const unpublishFreeStatus = transactionStates.STARTED
        const undeployPaidStatus = transactionStates.STARTED
        const statuses = {
            [publishActionTypes.UNPUBLISH_FREE]: unpublishFreeStatus,
            [publishActionTypes.UNDEPLOY_CONTRACT_PRODUCT]: undeployPaidStatus,
        }
        return <PublishError onClose={action('onClose')} status={statuses} publishMode={PublishMode.UNPUBLISH} />
    })
story('Product Editor/ReadyToPublishDialog')
    .add('Publish', () => (
        <ReadyToPublishDialog
            onCancel={action('onCancel')}
            onContinue={action('onContinue')}
            publishMode={PublishMode.PUBLISH}
            nativeTokenName="ETH"
        />
    ))
    .add('Republish', () => (
        <ReadyToPublishDialog
            onCancel={action('onCancel')}
            onContinue={action('onContinue')}
            publishMode={PublishMode.REPUBLISH}
            nativeTokenName="ETH"
        />
    ))
    .add('Redeploy', () => (
        <ReadyToPublishDialog
            onCancel={action('onCancel')}
            onContinue={action('onContinue')}
            publishMode={PublishMode.REDEPLOY}
            nativeTokenName="ETH"
        />
    ))
    .add('Unpublish', () => (
        <ReadyToPublishDialog
            onCancel={action('onCancel')}
            onContinue={action('onContinue')}
            publishMode={PublishMode.UNPUBLISH}
            nativeTokenName="ETH"
        />
    ))
story('Product Editor/GuidedDeployDataUnionDialog').add('default', () => (
    <GuidedDeployDataUnionDialog // $FlowFixMe missing properties are fine here
        product={{
            id: '1',
            name: 'Example product',
            type: 'DATAUNION',
        }}
        onClose={action('onClose')}
        onContinue={action('onContinue')}
    />
))
story('Product Editor/ConfirmDeployDataUnionDialog').add('default', () => (
    <ConfirmDeployDataUnionDialog // $FlowFixMe missing properties are fine here
        product={{
            id: '1',
            name: 'Example product',
            type: 'DATAUNION',
        }}
        onClose={action('onClose')}
        onContinue={action('onContinue')}
        onShowGuidedDialog={action('onShowGuidedDialog')}
    />
))
story('Product Editor/DeployingCommunityDialog')
    .add('default', () => (
        <DeployingDataUnionDialog // $FlowFixMe missing properties are fine here
            product={{
                id: '1',
                name: 'Example product',
                type: 'DATAUNION',
            }}
            estimate={360}
            onClose={action('onClose')}
            onContinue={action('onContinue')}
            spin={false}
        />
    ))
    .add('minimized', () => (
        <DeployingDataUnionDialog // $FlowFixMe missing properties are fine here
            product={{
                id: '1',
                name: 'Example product',
                type: 'DATAUNION',
            }}
            estimate={360}
            onClose={action('onClose')}
            onContinue={action('onContinue')}
            minimized
            spin={false}
        />
    ))
story('Marketplace/GetDataTokensDialog')
    .add('default', () => <GetDataTokensDialog onCancel={action('onCancel')} />)
    .add('default iPhone', () => <GetDataTokensDialog onCancel={action('onCancel')} />, {
        viewport: {
            defaultViewport: 'iPhone',
        },
    })
story('Marketplace/GetCryptoDialog')
    .add('default', () => <GetCryptoDialog onCancel={action('onCancel')} nativeTokenName="Ether" />)
    .add('default (iPhone)', () => <GetCryptoDialog onCancel={action('onCancel')} nativeTokenName="Ether" />, {
        viewport: {
            defaultViewport: 'iPhone',
        },
    })
story('Marketplace/InsufficientDataDialog')
    .add('default', () => <InsufficientDataDialog onCancel={action('onCancel')} />)
    .add('default (iPhone)', () => <InsufficientDataDialog onCancel={action('onCancel')} />, {
        viewport: {
            defaultViewport: 'iPhone',
        },
    })
story('Marketplace/InsufficientDaiDialog')
    .add('default', () => <InsufficientDaiDialog onCancel={action('onCancel')} />)
    .add('default (iPhone)', () => <InsufficientDaiDialog onCancel={action('onCancel')} />, {
        viewport: {
            defaultViewport: 'iPhone',
        },
    })
story('Marketplace/InsufficientTokenDialog')
    .add('default', () => <InsufficientTokenDialog onCancel={action('onCancel')} tokenSymbol="ETH" />)
    .add('default (iPhone)', () => <InsufficientTokenDialog onCancel={action('onCancel')} tokenSymbol="ETH" />, {
        viewport: {
            defaultViewport: 'iPhone',
        },
    })
story('Marketplace/NoBalanceDialog')
    .add('eth balance 0', () => (
        <NoBalanceDialog
            required={{
                gas: BN(0),
            }}
            balances={{
                native: BN(0),
            }}
            paymentCurrency="DATA"
            nativeTokenName="Ether"
            productTokenSymbol="DATA"
            onCancel={action('onCancel')}
        />
    ))
    .add('eth balance < required', () => (
        <NoBalanceDialog
            required={{
                gas: BN(1),
                eth: BN(2),
            }}
            balances={{
                native: BN(1),
                data: BN(0),
            }}
            paymentCurrency="ETH"
            nativeTokenName="Ether"
            productTokenSymbol="DATA"
            onCancel={action('onCancel')}
        />
    ))
    .add('DATA balance 0', () => (
        <NoBalanceDialog
            required={{
                gas: BN(0),
                eth: BN(2),
            }}
            balances={{
                native: BN(3),
                data: BN(0),
            }}
            paymentCurrency="DATA"
            nativeTokenName="Ether"
            productTokenSymbol="DATA"
            onCancel={action('onCancel')}
        />
    ))
    .add('DATA balance < required', () => (
        <NoBalanceDialog
            required={{
                gas: BN(0),
                eth: BN(2),
                data: BN(3),
            }}
            balances={{
                native: BN(3),
                data: BN(2),
            }}
            paymentCurrency="DATA"
            nativeTokenName="Ether"
            productTokenSymbol="DATA"
            onCancel={action('onCancel')}
        />
    ))
    .add('DAI balance < required', () => (
        <NoBalanceDialog
            required={{
                gas: BN(0),
                eth: BN(2),
                dai: BN(3),
            }}
            balances={{
                native: BN(3),
                dai: BN(2),
            }}
            paymentCurrency="DAI"
            nativeTokenName="Ether"
            productTokenSymbol="DATA"
            onCancel={action('onCancel')}
        />
    ))
story('Marketplace/ChooseAccessPeriodDialog')
    .add('default', () => (
        <ChooseAccessPeriodDialog
            pricePerSecond={BN(1).dividedBy(3600)}
            priceCurrency="DATA"
            pricingTokenAddress="0x123"
            pricingTokenDecimals={BN(18)}
            tokenSymbol="TEST"
            chainId={1}
            balances={{
                ETH: BN(10),
                DATA: BN(200),
                DAI: BN(999),
            }}
            onCancel={action('onCancel')}
            onNext={action('onNext')}
        />
    ))
    .add(
        'default (iPhone)',
        () => (
            <ChooseAccessPeriodDialog
                pricePerSecond={BN(1).dividedBy(3600)}
                priceCurrency="DATA"
                pricingTokenAddress="0x123"
                pricingTokenDecimals={BN(18)}
                tokenSymbol="TEST"
                chainId={1}
                balances={{
                    ETH: BN(10),
                    DATA: BN(200),
                    DAI: BN(999),
                }}
                onCancel={action('onCancel')}
                onNext={action('onNext')}
            />
        ),
        {
            viewport: {
                defaultViewport: 'iPhone',
            },
        },
    )
    .add('initial values', () => (
        <ChooseAccessPeriodDialog
            pricePerSecond={BN(1).dividedBy(3600)}
            priceCurrency="DATA"
            pricingTokenAddress="0x123"
            pricingTokenDecimals={BN(18)}
            tokenSymbol="TEST"
            chainId={1}
            balances={{
                ETH: BN(10),
                DATA: BN(200),
                DAI: BN(999),
            }}
            onCancel={action('onCancel')}
            onNext={action('onNext')}
            initialValues={{
                time: '1',
                timeUnit: 'day',
                paymentCurrency: 'ETH',
                price: '-',
                approxUsd: '-',
            }}
        />
    ))
story('Marketplace/PurchaseSummaryDialog')
    .add('default', () => (
        <PurchaseSummaryDialog
            name="Example Product"
            price={BN(123)}
            paymentCurrency="DATA"
            tokenSymbol="TEST"
            time={'24'}
            timeUnit={'hour'}
            approxUsd="0.11"
            onBack={action('onBack')}
            onCancel={action('onCancel')}
            onPay={action('onPay')}
        />
    ))
    .add(
        'default (iPhone)',
        () => (
            <PurchaseSummaryDialog
                name="Example Product"
                price={BN(123)}
                paymentCurrency="DATA"
                tokenSymbol="TEST"
                time="24"
                timeUnit="hour"
                approxUsd="0.11"
                onBack={action('onBack')}
                onCancel={action('onCancel')}
                onPay={action('onPay')}
            />
        ),
        {
            viewport: {
                defaultViewport: 'iPhone',
            },
        },
    )
    .add('waiting', () => (
        <PurchaseSummaryDialog
            name="Example Product"
            price={BN(123)}
            paymentCurrency="DATA"
            tokenSymbol="TEST"
            time="24"
            timeUnit="hour"
            approxUsd="0.11"
            onBack={action('onBack')}
            onCancel={action('onCancel')}
            onPay={action('onPay')}
            waiting
        />
    ))
    .add(
        'waiting (iPhone)',
        () => (
            <PurchaseSummaryDialog
                name="Example Product"
                price={BN(123)}
                paymentCurrency="DATA"
                tokenSymbol="TEST"
                time="24"
                timeUnit="hour"
                approxUsd="0.11"
                onBack={action('onBack')}
                onCancel={action('onCancel')}
                onPay={action('onPay')}
                waiting
            />
        ),
        {
            viewport: {
                defaultViewport: 'iPhone',
            },
        },
    )
story('Marketplace/PurchaseTransactionProgress').add('default', () => {
    const resetDataAllowanceStatus = transactionStates.STARTED
    const setDataAllowanceStatus = transactionStates.STARTED
    const resetDaiAllowanceStatus = transactionStates.STARTED
    const setDaiAllowanceStatus = transactionStates.STARTED
    const purchaseStateStatus = transactionStates.STARTED
    const statuses = {
        [purchaseActionTypes.RESET_DATA_ALLOWANCE]: resetDataAllowanceStatus,
        [purchaseActionTypes.SET_DATA_ALLOWANCE]: setDataAllowanceStatus,
        [purchaseActionTypes.RESET_DAI_ALLOWANCE]: resetDaiAllowanceStatus,
        [purchaseActionTypes.SET_DAI_ALLOWANCE]: setDaiAllowanceStatus,
        [purchaseActionTypes.SUBSCRIPTION]: purchaseStateStatus,
    }
    const prompt = {
        none: undefined,
        ...purchaseActionTypes,
    }
    return (
        <PurchaseTransactionProgress onCancel={action('cancel')} status={statuses} prompt={prompt} tokenSymbol="DATA" />
    )
})
story('Marketplace/PurchaseComplete').add('default', () => (
    <PurchaseComplete
        onContinue={action('onContinue')}
        onClose={action('onClose')}
        txHash="0x68dda92ba60240b74b2a79c2b7c87c3316273b40b6d93d6367d95b5a467fe885"
        chainId={137}
    />
))
story('Marketplace/PurchaseError').add('default', () => {
    const resetDataAllowanceStatus = transactionStates.STARTED
    const setDataAllowanceStatus = transactionStates.STARTED
    const resetDaiAllowanceStatus = transactionStates.STARTED
    const setDaiAllowanceStatus = transactionStates.STARTED
    const purchaseStateStatus = transactionStates.STARTED
    const statuses = {
        [purchaseActionTypes.RESET_DATA_ALLOWANCE]: resetDataAllowanceStatus,
        [purchaseActionTypes.SET_DATA_ALLOWANCE]: setDataAllowanceStatus,
        [purchaseActionTypes.RESET_DAI_ALLOWANCE]: resetDaiAllowanceStatus,
        [purchaseActionTypes.SET_DAI_ALLOWANCE]: setDaiAllowanceStatus,
        [purchaseActionTypes.SUBSCRIPTION]: purchaseStateStatus,
    }
    return <PurchaseError onClose={action('onClose')} status={statuses} />
})
story('Marketplace/ErrorDialog')
    .add('default', () => (
        <ErrorDialog
            onClose={action('close')}
            title={'Dialog title'}
            message={'Dialog text'}
        />
    ))
    .add('waiting', () => (
        <ErrorDialog
            onClose={action('close')}
            title={'Dialog title'}
            message={'Dialog text'}
            waiting
        />
    ))
story('Product Editor/CropImageModal').add('default', () => (
    <CropImageModal imageUrl={croppedImage} onClose={action('onClose')} onSave={action('onSave')} />
))
story('Product Editor/Whitelist/AddWhitelistedAddress').add('default', () => (
    <AddWhitelistedAddressDialog onClose={action('onClose')} onContinue={action('onContinue')} />
))
story('Product Editor/Whitelist/RemoveWhitelistedAddressDialog').add('default', () => (
    <RemoveWhitelistedAddressDialog onClose={action('onClose')} onContinue={action('onContinue')} />
))
story('Product Editor/Whitelist/WhitelistEditProgressDialog').add('default', () => {
    const setWhitelistStatus = transactionStates.STARTED
    const addWhitelistedAddressStatus = transactionStates.STARTED
    const removeWhitelistedAddressStatus = transactionStates.STARTED
    const statuses = {
        [whitelistActionTypes.SET_REQUIRES_WHITELIST]: setWhitelistStatus,
        [whitelistActionTypes.ADD_WHITELIST_ADDRESS]: addWhitelistedAddressStatus,
        [whitelistActionTypes.REMOVE_WHITELIST_ADDRESS]: removeWhitelistedAddressStatus,
    }
    return (
        <WhitelistEditProgressDialog
            onCancel={action('onCancel')}
            status={statuses}
            isPrompted={false}
        />
    )
})
story('Product Editor/Whitelist/WhitelistEditErrorDialog').add('default', () => {
    const setWhitelistStatus = transactionStates.STARTED
    const addWhitelistedAddressStatus = transactionStates.STARTED
    const removeWhitelistedAddressStatus = transactionStates.STARTED
    const statuses = {
        [whitelistActionTypes.SET_REQUIRES_WHITELIST]: setWhitelistStatus,
        [whitelistActionTypes.ADD_WHITELIST_ADDRESS]: addWhitelistedAddressStatus,
        [whitelistActionTypes.REMOVE_WHITELIST_ADDRESS]: removeWhitelistedAddressStatus,
    }
    return <WhitelistEditErrorDialog onClose={action('onClose')} status={statuses} />
})
story('Marketplace/WhitelistRequestAccessDialog').add('default', () => (
    <WhitelistRequestAccessDialog
        contactEmail="tester1@streamr.com"
        productName="Test Product"
        onClose={action('onClose')}
    />
))
story('Marketplace/SwitchWalletAccountDialog').add('default', () => (
    <SwitchWalletAccountDialog onContinue={action('onContinue')} onClose={action('onClose')} />
))
story('Streams/SnippetDialog').add('default', () => (
    <SnippetDialog
        snippets={subscribeSnippets({
            id: 'stream-id',
        })}
        onClose={action('onClose')}
    />
))
story('Shared/ConfirmDialog')
    .add('default', () => (
        <ConfirmDialog
            title="Dangerous action"
            message="Are you sure?"
            onAccept={action('onAccept')}
            onReject={action('onReject')}
        />
    ))
    .add('centered buttons', () => (
        <ConfirmDialog
            title="Dangerous action"
            message="Are you sure?"
            centerButtons
            onAccept={action('onAccept')}
            onReject={action('onReject')}
        />
    ))
    .add("don't show again selection", () => (
        <ConfirmDialog
            title="Dangerous action"
            message="Are you sure?"
            dontShowAgain
            onAccept={action('onAccept')}
            onReject={action('onReject')}
        />
    ))
    .add('customButtons', () => (
        <ConfirmDialog
            title="Dangerous action"
            message="Are you sure?"
            acceptButton={{
                title: 'Delete',
                kind: 'destructive',
            }}
            cancelButton={{
                title: "Don't delete",
                kind: 'secondary',
            }}
            centerButtons
            onAccept={action('onAccept')}
            onReject={action('onReject')}
        />
    ))
story('Shared/ConfirmSaveDialog').add('default', () => (
    <ConfirmSaveDialog onClose={action('onClose')} onContinue={action('onContinue')} onSave={action('onSave')}>
        <p>{'Dialog text'}</p>
    </ConfirmSaveDialog>
))
story('Shared/UnlockWalletDialog')
    .add('default', () => (
        <UnlockWalletDialog title={'Dialog title'} onClose={action('onClose')} />
    ))
    .add('with text', () => (
        <UnlockWalletDialog title={'Dialog title'} onClose={action('onClose')}>
            {'Please unlock your wallet'}
        </UnlockWalletDialog>
    ))
    .add('with address', () => (
        <UnlockWalletDialog
            title={'Dialog title'}
            onClose={action('onClose')}
            requiredAddress="0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0"
        >
            {'Please unlock your wallet'}
        </UnlockWalletDialog>
    ))
    .add(
        'with address (iPhone)',
        () => (
            <UnlockWalletDialog
                title={'Dialog title'}
                onClose={action('onClose')}
                requiredAddress="0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0"
            >
                {'Please unlock your wallet'}
            </UnlockWalletDialog>
        ),
        {
            viewport: {
                defaultViewport: 'iPhone',
            },
        },
    )
    .add('with different icon', () => (
        <UnlockWalletDialog
            title={'Dialog title'}
            onClose={action('onClose')}
            icon={'walletError'}
        >
            {'Please unlock your wallet'}
        </UnlockWalletDialog>
    ))
    .add('waiting', () => (
        <UnlockWalletDialog waiting title={'Dialog title'} onClose={action('onClose')} />
    ))
story('Shared/Web3NotDetectedDialog')
    .add('install Metamask', () => <InstallMetaMaskDialog onClose={action('onClose')} />)
    .add('install Metamask (iPhone)', () => <InstallMetaMaskDialog onClose={action('onClose')} />, {
        viewport: {
            defaultViewport: 'iPhone',
        },
    })
    .add('install mobile app', () => <InstallMobileApplicationDialog onClose={action('onClose')} />)
    .add('install mobile app (iPhone)', () => <InstallMobileApplicationDialog onClose={action('onClose')} />, {
        viewport: {
            defaultViewport: 'iPhone',
        },
    })
    .add('install supported browser', () => <InstallSupportedBrowserDialog onClose={action('onClose')} />)
    .add('install supported browser (iPhone)', () => <InstallSupportedBrowserDialog onClose={action('onClose')} />, {
        viewport: {
            defaultViewport: 'iPhone',
        },
    })
story('Shared/WrongNetworkSelectedDialog')
    .add('default', () => (
        <WrongNetworkSelectedDialog
            requiredNetwork={'1'}
            currentNetwork={'2'}
            onClose={action('onClose')}
            onSwitch={action('onSwitch')}
        />
    ))
    .add('switching', () => (
        <WrongNetworkSelectedDialog
            requiredNetwork={'1'}
            currentNetwork={'2'}
            switching
            onClose={action('onClose')}
            onSwitch={action('onSwitch')}
        />
    ))
story('Profile/AvatarUploadDialog')
    .add('default', () => (
        <AvatarUploadDialog originalImage="" onClose={action('onClose')} onUpload={action('onUpload')} />
    ))
    .add('with original image', () => (
        <AvatarUploadDialog
            originalImage="https://miro.medium.com/fit/c/256/256/1*NfJkA-ChiQtYLRBOLryZxQ.jpeg"
            onClose={action('onClose')}
            onUpload={action('onUpload')}
        />
    ))
story('Profile/CropAvatarDialog')
    .add('default', () => (
        <CropAvatarDialog originalImage={croppedImage} onClose={action('onClose')} onSave={action('onSave')} />
    ))
    .add('waiting', () => (
        <CropAvatarDialog originalImage={croppedImage} onClose={action('onClose')} onSave={action('onSave')} waiting />
    ))
story('Profile/DeleteAccountDialog')
    .add('default', () => <DeleteAccountDialogComponent onClose={action('onClose')} onSave={action('onSave')} />)
    .add('waiting', () => (
        <DeleteAccountDialogComponent onClose={action('onClose')} onSave={action('onSave')} waiting />
    ))
