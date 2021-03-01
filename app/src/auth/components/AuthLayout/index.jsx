import * as React from 'react'
import styled from 'styled-components'

import { CoreHelmet } from '$shared/components/Helmet'
import { MD } from '$shared/utils/styled'
import routes from '$routes'

import Logo from '../Logo'
import styles from './authLayout.pcss'

const Panel = styled.div`
`

const TitleBar = styled.div`
    font-weight: var(--medium);
    font-size: 18px;
    line-height: 48px;
    text-align: center;
`

const Footer = styled.div`
    margin: 0 auto;
    max-width: 432px;
    font-size: 12px;
    color: var(--greyLight);
    text-align: center;
`

const UnstyledLayout = ({ children, ...props }) => (
    <React.Fragment>
        <CoreHelmet
            htmlAttributes={{
                class: styles.html,
            }}
        />
        <div {...props}>
            <Logo />
            <TitleBar>Streamr Core</TitleBar>
            <Panel>
                {children}
            </Panel>
            <Footer>
                <span>
                    By connecting your wallet and using Streamr <br />
                    you agree to our
                    {' '}
                    <a href={routes.tos()} target="_blank" rel="nofollow noopener noreferrer">
                        Terms of Service
                    </a>
                </span>
            </Footer>
        </div>
    </React.Fragment>
)

const AuthLayout = styled(UnstyledLayout)`
    display: flex;
    flex-direction: column;
    flex-grow: 0.8;
    justify-content: center;
    padding: 0 1em;
    margin: 48px auto 88px;
    color: #323232;

    ${Panel} {
        margin-top: 40px;
    }

    ${Footer} {
        margin-top: 60px;
    }

    @media (min-width: ${MD}px) {
        margin: 152px auto 192px;

        ${TitleBar} {
            font-size: 24px;
        }

        ${Panel} {
            margin-top: 110px;
        }

        ${Footer} {
            margin-top: 120px;

            br {
                display: none;
            }
        }
    }
`

export default AuthLayout
