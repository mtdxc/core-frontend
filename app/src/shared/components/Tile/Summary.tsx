import type { Node } from 'react'
import React from 'react'
import styled from 'styled-components'
import Skeleton from '$shared/components/Skeleton'
import { MEDIUM } from '$shared/utils/styled'
const Name = styled.div``
const Secondary = styled.div`
    font-size: 12px;
`
const Description = styled(Secondary)`
    color: #a3a3a3;
    overflow-x: hidden;
    text-overflow: ellipsis;
`
const Label = styled(Secondary)`
    text-align: right;
`
const Root = styled.div`
    display: grid;
    grid-template-columns: auto auto;
    grid-gap: 0.5em;
    color: #323232;
    font-size: 16px;
    font-weight: ${MEDIUM};
    line-height: 20px;
    padding-top: 8px;
`
type Props = {
    label?: Node
    name: string
    skeletonize?: boolean
    description?: string | false
}

const Summary = ({ name, description, label, skeletonize, ...props }: Props) => (
    <Root {...props}>
        <div>
            <Name>
                <Skeleton disabled={!skeletonize}>{name}</Skeleton>
            </Name>
            {!!description && (
                <Description>
                    <Skeleton disabled={!skeletonize} width="45%">
                        {description}
                    </Skeleton>
                </Description>
            )}
        </div>
        {!!label && (
            <Label>
                <Skeleton disabled={!skeletonize} width="30%">
                    {label}
                </Skeleton>
            </Label>
        )}
    </Root>
)

export default Summary
