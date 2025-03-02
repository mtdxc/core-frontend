import { normalize } from 'normalizr'
import mockStore from '$app/test/test-utils/mockStoreProvider'
import * as actions from '$mp/modules/categories/actions'
import * as constants from '$mp/modules/categories/constants'
import * as entityConstants from '$shared/modules/entities/constants'
import * as services from '$mp/modules/categories/services'
import { categoriesSchema } from '$shared/modules/entities/schema'
import { CategoryList } from '$mp/types/category-types'
describe('categories - actions', () => {
    beforeEach(() => {})
    afterEach(() => {
        jest.clearAllMocks()
        jest.restoreAllMocks()
    })
    describe('getCategories', () => {
        it('gets categories succesfully', async () => {
            const categories: CategoryList = [
                {
                    id: '1',
                    name: 'Test 1',
                    imageUrl: ''
                },
                {
                    id: '2',
                    name: 'Test 2',
                    imageUrl: ''
                },
            ]
            const { result, entities } = normalize(categories, categoriesSchema)
            jest.spyOn(services, 'getCategories').mockImplementation(() => Promise.resolve(categories))
            const store = mockStore()
            await actions.getCategories(true)(store.dispatch)
            const expectedActions = [
                {
                    type: constants.GET_CATEGORIES_REQUEST,
                },
                {
                    type: entityConstants.UPDATE_ENTITIES,
                    payload: {
                        entities,
                    },
                },
                {
                    type: constants.GET_CATEGORIES_SUCCESS,
                    payload: {
                        categories: result,
                    },
                },
            ]
            expect(store.getActions()).toStrictEqual(expectedActions)
        })
        it('responds to errors', async () => {
            const error = new Error('Error')
            jest.spyOn(services, 'getCategories').mockImplementation(() => Promise.reject(error))
            const store = mockStore()
            await actions.getCategories(true)(store.dispatch)
            const expectedActions = [
                {
                    type: constants.GET_CATEGORIES_REQUEST,
                },
                {
                    type: constants.GET_CATEGORIES_FAILURE,
                    error: true,
                    payload: error,
                },
            ]
            expect(store.getActions()).toStrictEqual(expectedActions)
        })
    })
})
