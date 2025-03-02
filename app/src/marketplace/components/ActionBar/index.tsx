import React, { useMemo, useCallback } from 'react'
import BN from 'bignumber.js'
import { Container as UnstyledContainer } from 'reactstrap'
import styled from 'styled-components'
import Button from '$shared/components/Button'
import { LG } from '$shared/utils/styled'
import useModal from '$shared/hooks/useModal'
import type { Filter, SearchFilter, CategoryFilter, SortByFilter, ProductTypeFilter } from '../../types/product-types'
import type { Category } from '../../types/category-types'
import { isValidSearchQuery } from '../../utils/validate'
import SearchInput from './SearchInput'
import FilterSelector from './FilterSelector'
import FilterModal from './FilterModal'
export type Props = {
    filter: Filter
    categories: Array<Category> | null | undefined
    onFilterChange: (filter: Filter) => void
    onSearchChange: (search: SearchFilter) => void
    onCreateProduct: () => void
}
const sortByOptions = [
    {
        id: 'pricePerSecond',
        title: 'Price, low to high',
    },
    {
        id: 'free',
        title: 'Free products only',
    },
    {
        id: 'dateCreated',
        title: 'Latest',
    },
]
const Filters = styled.div`
    background-color: white;
`
const Container = styled(UnstyledContainer)`
    padding: 0 30px;

    ul {
        margin: 0;
        list-style: none;
        padding: 1em 0;
        display: flex;
        align-items: center;
    }

    li {
        flex: 1;

        + li {
            margin-left: 0;
        }

        :last-child {
            display: none;
        }
    }

    @media (min-width: ${LG}px) {
        padding: 0 5em;

        ul {
            padding: 1.5em 0;
        }

        li {
            display: inline-block;
            outline: none !important;
            flex: unset;

            :last-child {
                margin-left: auto;
                display: block;
            }
        }

        li + li {
            margin-left: 3em;
        }
    }
`

const UnstyledActionBar = ({
    filter,
    categories,
    onCreateProduct,
    onFilterChange: onFilterChangeProp,
    onSearchChange: onSearchChangeProp,
    ...props
}: Props) => {
    const { api: filterModal } = useModal('marketplace.filter')
    const onSearchChange = useCallback(
        (search: SearchFilter) => {
            if (isValidSearchQuery(search)) {
                onSearchChangeProp(search)
            }
        },
        [onSearchChangeProp],
    )
    const onCategoryChange = useCallback(
        (category: CategoryFilter | null | undefined) => {
            onFilterChangeProp({
                categories: category !== '__all' ? category : undefined,
            })
            filterModal.close()
        },
        [onFilterChangeProp, filterModal],
    )
    const onSortByChange = useCallback(
        (sortBy: SortByFilter | null | undefined) => {
            if (sortBy === 'free') {
                onFilterChangeProp({
                    sortBy: undefined,
                    maxPrice: '0',
                    order: undefined,
                })
            } else if (sortBy === 'dateCreated') {
                onFilterChangeProp({
                    maxPrice: undefined,
                    sortBy: 'dateCreated',
                    order: 'desc',
                })
            } else {
                onFilterChangeProp({
                    maxPrice: undefined,
                    sortBy,
                    order: 'asc',
                })
            }

            filterModal.close()
        },
        [onFilterChangeProp, filterModal],
    )
    const onProductTypeChange = useCallback(
        (type: ProductTypeFilter | null | undefined) => {
            onFilterChangeProp({
                type,
            })
            filterModal.close()
        },
        [onFilterChangeProp, filterModal],
    )
    const clearSearch = useCallback(() => {
        onSearchChangeProp('')
    }, [onSearchChangeProp])
    const productTypeOptions = useMemo(
        () => [
            {
                id: 'all',
                value: undefined,
                title: 'All products',
            },
            {
                id: 'normal',
                value: 'normal',
                title: 'Data Products',
            },
            {
                id: 'dataunion',
                value: 'dataunion',
                title: 'Data Unions',
            },
        ],
        [],
    )
    const categoryOptions = useMemo(
        () => [
            {
                id: '__all',
                value: '__all',
                title: 'Everything',
            },
            ...(categories
                ? categories.map((c) => ({
                    id: c.id,
                    value: c.id,
                    title: c.name,
                }))
                : []),
        ],
        [categories],
    )
    const sortOptions = useMemo(
        () =>
            sortByOptions.map(({ id, title }) => ({
                id,
                value: id,
                title,
            })),
        [],
    )
    const { categories: category, maxPrice, sortBy, type } = filter
    const currentSortByFilter = useMemo(() => {
        const { id: currentId } =
            (BN(maxPrice).isEqualTo('0') ? sortByOptions.find(({ id }) => id === 'free') : sortByOptions.find(({ id }) => id === sortBy)) || {}
        return currentId
    }, [maxPrice, sortBy])
    return (
        <div {...props}>
            <SearchInput value={filter.search} onChange={onSearchChange} onClear={clearSearch} hidePlaceholderOnFocus />
            <FilterModal />
            <Filters>
                <Container fluid>
                    <ul>
                        <li>
                            <FilterSelector title="Product type" selected={type} onChange={onProductTypeChange} options={productTypeOptions} />
                        </li>
                        <li>
                            <FilterSelector title="Category" selected={category} onChange={onCategoryChange} options={categoryOptions} />
                        </li>
                        <li>
                            <FilterSelector title="Sort by" selected={currentSortByFilter} onChange={onSortByChange} options={sortOptions} />
                        </li>
                        <li>
                            <Button kind="secondary" type="button" onClick={() => onCreateProduct()}>
                                Create a Product
                            </Button>
                        </li>
                    </ul>
                </Container>
            </Filters>
        </div>
    )
}

const ActionBar = styled(UnstyledActionBar)`
    color: #323232;
`
export default ActionBar
