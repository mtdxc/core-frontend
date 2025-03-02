import React, { useReducer, useMemo, useCallback } from 'react'
import { storiesOf } from '@storybook/react'
import styles from '@sambego/storybook-styles'
import { action } from '@storybook/addon-actions'
import styled from 'styled-components'
import StreamListingWithContainer, { StreamListing } from './'
const Container = styled.div`
    padding: 3rem;
`
const stories = storiesOf('Marketplace/StreamListing', module)
    .addDecorator(
        styles({
            color: '#323232',
            fontSize: '16px',
        }),
    )
const streamList = [
    {
        id: 'test-stream-1',
        name: 'Ruuvi sensor',
        description: 'Short description',
        requireEncryptedData: false,
        requireSignedData: false,
        partitions: 0,
        config: {},
    },
    {
        id: 'test-stream-2',
        name: 'Tram Data',
        description: '',
        requireEncryptedData: true,
        requireSignedData: false,
        partitions: 0,
        config: {},
    },
    {
        id: 'test-stream-3',
        name: 'Third stream',
        description: 'Description that is really long and will break the layout if it goes long enough over the screen',
        requireEncryptedData: false,
        requireSignedData: true,
        partitions: 5,
        config: {},
    },
]
const longStreamList = [...Array(1000)].map((value, index) => ({
    id: `test-stream-${index}`,
    name: `Stream ${index}`,
    description: `Description ${index}`,
    requireEncryptedData: false,
    requireSignedData: false,
    partitions: 0,
    config: {},
}))

const DefaultView = () => {
    const showPreview = true
    const showSettings = true
    return (
        <StreamListingWithContainer
            streams={streamList}
            totalStreams={streamList.length}
            onStreamPreview={!!showPreview && action('onStreamPreview')}
            onStreamSettings={!!showSettings && action('onStreamSettings')}
        />
    )
}

stories.add('default', () => <DefaultView />)
stories.add('default (tablet)', () => <DefaultView />, {
    viewport: {
        defaultViewport: 'sm',
    },
})
stories.add('default (iPhone)', () => <DefaultView />, {
    viewport: {
        defaultViewport: 'iPhone',
    },
})

const FetchingView = () => {
    const showPreview = true
    const showSettings = true
    return (
        <StreamListingWithContainer
            streams={[]}
            onStreamPreview={!!showPreview && action('onStreamPreview')}
            onStreamSettings={!!showSettings && action('onStreamSettings')}
            fetchingStreams
            locked={false}
        />
    )
}

stories.add('fetching streams', () => <FetchingView />)
stories.add('fetching streams (tablet)', () => <FetchingView />, {
    viewport: {
        defaultViewport: 'sm',
    },
})
stories.add('fetching streams (iPhone)', () => <FetchingView />, {
    viewport: {
        defaultViewport: 'iPhone',
    },
})

const EmptyView = () => {
    const showPreview = true
    const showSettings = true
    return (
        <StreamListingWithContainer
            streams={[]}
            totalStreams={0}
            onStreamPreview={!!showPreview && action('onStreamPreview')}
            onStreamSettings={!!showSettings && action('onStreamSettings')}
            locked={false}
        />
    )
}

stories.add('empty', () => <EmptyView />)
stories.add('empty (tablet)', () => <EmptyView />, {
    viewport: {
        defaultViewport: 'sm',
    },
})
stories.add('empty (iPhone)', () => <EmptyView />, {
    viewport: {
        defaultViewport: 'iPhone',
    },
})

const LongListView = () => {
    const showPreview = true
    const showSettings = true
    return (
        <StreamListingWithContainer
            streams={longStreamList}
            totalStreams={longStreamList.length}
            onStreamPreview={!!showPreview && action('onStreamPreview')}
            onStreamSettings={!!showSettings && action('onStreamSettings')}
        />
    )
}

stories.add('long list', () => <LongListView />)
stories.add('long list (tablet)', () => <LongListView />, {
    viewport: {
        defaultViewport: 'sm',
    },
})
stories.add('long list (iPhone)', () => <LongListView />, {
    viewport: {
        defaultViewport: 'iPhone',
    },
})

const LockedView = () => {
    const showPreview = true
    const showSettings = true
    return (
        <StreamListingWithContainer
            streams={streamList}
            totalStreams={streamList.length}
            onStreamPreview={!!showPreview && action('onStreamPreview')}
            onStreamSettings={!!showSettings && action('onStreamSettings')}
            locked
        />
    )
}

stories.add('locked', () => <LockedView />)
stories.add('locked (tablet)', () => <LockedView />, {
    viewport: {
        defaultViewport: 'sm',
    },
})
stories.add('locked (iPhone)', () => <LockedView />, {
    viewport: {
        defaultViewport: 'iPhone',
    },
})

const WithoutContainerView = () => {
    const showPreview = true
    const showSettings = true
    return (
        <Container>
            <StreamListing
                streams={streamList}
                totalStreams={streamList.length}
                onStreamPreview={!!showPreview && action('onStreamPreview')}
                onStreamSettings={!!showSettings && action('onStreamSettings')}
            />
        </Container>
    )
}

stories.add('without container', () => <WithoutContainerView />)
stories.add('without container (tablet)', () => <WithoutContainerView />, {
    viewport: {
        defaultViewport: 'sm',
    },
})
stories.add('without container (iPhone)', () => <WithoutContainerView />, {
    viewport: {
        defaultViewport: 'iPhone',
    },
})
const PAGE_SIZE = 100

const LoadingMoreListView = () => {
    const showPreview = true
    const showSettings = true
    const [page, advancePage] = useReducer((p) => p + 1, 1)
    const [visibleStreams, hasMoreResults] = useMemo(() => {
        const nextItems = longStreamList.slice(0, page * PAGE_SIZE)
        return [nextItems, nextItems.length < longStreamList.length]
    }, [page])
    const onLoadMore = useCallback(() => {
        advancePage()
    }, [advancePage])
    return (
        <StreamListingWithContainer
            streams={visibleStreams}
            totalStreams={longStreamList.length}
            hasMoreResults={hasMoreResults}
            onLoadMore={onLoadMore}
            onStreamPreview={!!showPreview && action('onStreamPreview')}
            onStreamSettings={!!showSettings && action('onStreamSettings')}
        />
    )
}

stories.add('loading more', () => <LoadingMoreListView />)
stories.add('loading more (tablet)', () => <LoadingMoreListView />, {
    viewport: {
        defaultViewport: 'sm',
    },
})
stories.add('loading more (iPhone)', () => <LoadingMoreListView />, {
    viewport: {
        defaultViewport: 'iPhone',
    },
})
