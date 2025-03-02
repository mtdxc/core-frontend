import React, { useMemo } from 'react'
import styled from 'styled-components'
import ModalPortal from '$shared/components/ModalPortal'
import Dialog from '$shared/components/Dialog'
import PngIcon from '$shared/components/PngIcon'
import { transactionStates } from '$shared/utils/constants'
const StyledPngIcon = styled(PngIcon)`
    margin: 0.5rem 0 2.5rem;
`
const actions = {
    setRequiresWhitelist: 'There was a problem enabling the whitelist.',
    addWhiteListAddress: 'There was a problem adding the address.',
    removeWhiteListAddress: 'There was a problem removing the address.',
    allFailed: 'Failed to update whitelist.',
    someFailed: 'More than one transaction failed.',
}

const UnstyledWhitelistEditErrorDialog = ({ publishMode, status, onClose, ...props }) => {
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
                {...props}
                onClose={onClose}
                title={`Whitelist update ${failedAction === 'allFailed' ? 'failed' : 'did not complete'}`}
            >
                <div>
                    <StyledPngIcon name="txFailed" alt="Transaction failed" />
                    <p>
                        {!!failedAction && actions[failedAction]}
                        &nbsp; Please check your wallet or other settings and try again.
                    </p>
                </div>
            </Dialog>
        </ModalPortal>
    )
}

const WhitelistEditErrorDialog = styled(UnstyledWhitelistEditErrorDialog)``
export default WhitelistEditErrorDialog
