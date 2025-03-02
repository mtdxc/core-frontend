import React, { useMemo } from 'react'
import styled from 'styled-components'
import ModalPortal from '$shared/components/ModalPortal'
import Dialog from '$shared/components/Dialog'
import PngIcon from '$shared/components/PngIcon'
import { transactionStates } from '$shared/utils/constants'
export type Status = Record<string, string>
export type Props = {
    onClose: () => void
    status: Status
}
const StyledPngIcon = styled(PngIcon)`
    margin: 0.5rem 0 2.5rem;
`
const actions = {
    setDaiAllowance: 'The allowance failed to update.',
    resetDaiAllowance: 'Resetting the allowance failed to update.',
    setDataAllowance: 'The allowance failed to update.',
    resetDataAllowance: 'Resetting the allowance failed to update.',
    subscription: 'Failed to subscribe to the product.',
    allFailed: 'Failed to subscribe to the product.',
    someFailed: 'More than one transaction failed.',
}

const PurchaseError = ({ status, onClose }: Props) => {
    const failedAction = useMemo(() => {
        const keys = Object.keys(status)
        const failed = keys.filter((key) => status[key] === transactionStates.FAILED)

        if (failed.length === keys.length) {
            return 'allFailed'
        } else if (failed.length === 1) {
            return failed[0]
        } else if (failed.length > 1) {
            return 'someFailed'
        }

        return undefined
    }, [status])
    return (
        <ModalPortal>
            <Dialog
                onClose={onClose}
                title={`Subscription ${failedAction === 'allFailed' ? 'failed' : 'did not complete'}`}
            >
                <div>
                    <StyledPngIcon name="txFailed" alt="Subscription failed" />
                    <p>
                        {!!failedAction && actions[failedAction]}
                        &nbsp; Please check your wallet or other settings and try again
                    </p>
                </div>
            </Dialog>
        </ModalPortal>
    )
}

export default PurchaseError
