import React from 'react'
import styled, { css } from 'styled-components'
import useExpiresIn, { formatRemainingTime } from '$shared/hooks/useExpiresIn'
type Props = {
    expiresAt: Date
    now?: number | null | undefined
    className?: string
    unstyled?: boolean
}
const Wrapper = styled.span<{expiresSoon: boolean, expired: boolean}>`
    && {
        ${({ expiresSoon }) =>
        !!expiresSoon &&
            css`
                border-color: #ff5c00;
                color: #ff5c00;
            `}

        ${({ expired }) =>
        !!expired &&
            css`
                border-color: #fb0606;
                color: #fb0606;
            `}
    }
`

const UnstyledExpirationCounter = ({ expiresAt, now, ...props }: Props) => {
    const secondsUntilExpiration = useExpiresIn(expiresAt, now == null ? undefined : new Date(now))
    return (
        <Wrapper {...props} expiresSoon={secondsUntilExpiration <= 3600} expired={secondsUntilExpiration < 0}>
            {secondsUntilExpiration <= 0 ? 'Expired' : `Expires in ${formatRemainingTime(secondsUntilExpiration)}`}
        </Wrapper>
    )
}

const ExpirationCounter = styled(UnstyledExpirationCounter)`
    ${({ unstyled }) =>
        !unstyled &&
        css`
            align-items: center;
            border: 1px solid #525252;
            border-radius: 4px;
            color: #525252;
            display: inline-flex;
            font-family: var(--sans);
            font-size: 12px;
            height: 24px;
            letter-spacing: 0;
            line-height: 24px;
            padding: 1px 8px;
            text-align: center;
        `}
`
export default ExpirationCounter
