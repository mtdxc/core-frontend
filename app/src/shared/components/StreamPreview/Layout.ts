import styled, { css, createGlobalStyle } from 'styled-components'
import { SM, MD, XL } from '$shared/utils/styled'

type Props = {
    inspectorWidth: number,
}

const Layout = createGlobalStyle<Props>`
    :root {
        --LiveDataInspectorMinWidth: 420px;
        --LiveDataMinLhsWidth: 248px;
        --LiveDataMinMargin: 8px;
        --LiveDataTimestampColumnMaxWidth: 224px;
    }

    @media (min-width: ${SM}px) {
        :root {
            --LiveDataInspectorMinWidth: 420px;
            --LiveDataMinLhsWidth: 248px;
            --LiveDataMinMargin: 8px;
            --LiveDataTimestampColumnMaxWidth: 224px;
        }
    }

    @media (min-width: ${MD}px) {
        :root {
            --LiveDataInspectorMinWidth: 420px;
            --LiveDataMinLhsWidth: 264px;
            --LiveDataMinMargin: 24px;
            --LiveDataTimestampColumnMaxWidth: 224px;
        }
    }

    @media (min-width: ${XL}px) {
        :root {
            --LiveDataInspectorMinWidth: 504px;
            --LiveDataMinLhsWidth: 332px;
            --LiveDataMinMargin: 92px;
            --LiveDataTimestampColumnMaxWidth: 360px;
        }
    }

    ${({ inspectorWidth }) => css`
        :root {
            --LiveDataInspectorWidth: 100vw;
        }

        @media (min-width: ${SM}px) {
            :root {
                --LiveDataInspectorWidth: ${inspectorWidth || 420}px;
            }
        }

        @media (min-width: ${XL}px) {
            :root {
                --LiveDataInspectorWidth: ${inspectorWidth || 504}px;
            }
        }
    `}
`

const Pusher = styled.div`
    min-width: var(--LiveDataMinMargin);
    max-width: calc((100vw - 1108px - var(--LiveDataInspectorMinWidth) - 32px) * 0.5);
    width: calc((100vw - 1108px - var(--LiveDataInspectorWidth) - 32px) * 0.5);
`

const FinalExport = Object.assign(Layout, {
    Pusher,
})
export default FinalExport
