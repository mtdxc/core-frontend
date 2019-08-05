// @flow

import React, { type Node } from 'react'
import cx from 'classnames'

import styles from './details.pcss'

type Props = {
    className?: string,
    children?: Node,
}

const Details = ({ className, children, ...props }: Props) => (
    <div className={cx(styles.root, styles.DetailsContainer, className)} {...props}>
        {children}
    </div>
)

export default Details
