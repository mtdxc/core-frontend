import EventEmitter from 'events'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { mount } from 'enzyme'
import { useClient } from 'streamr-client-react'
import Transaction from '$shared/utils/Transaction'
import * as contractProductServices from '$mp/modules/contractProduct/services'
import * as dataUnionServices from '$mp/modules/dataUnion/services'
import * as transactionActions from '$mp/modules/transactions/actions'
import * as productServices from '$mp/modules/product/services'
import * as web3Utils from '$mp/utils/web3'
import { transactionStates, transactionTypes } from '$shared/utils/constants'
import { PublishMode } from '../usePendingChanges'
import usePublish, { actionsTypes } from '../usePublish'
jest.mock('react-redux', () => ({
    useDispatch: jest.fn().mockImplementation(() => (action) => action),
}))
jest.mock('streamr-client-react', () => ({
    useClient: jest.fn(),
}))
jest.mock('$mp/utils/web3', () => ({
    ...jest.requireActual('$mp/utils/web3'),
    getCustomTokenDecimals: jest.fn().mockImplementation(() => 18),
}))

function stubStreams(streams) {
    const searchStreamsStub = jest.fn().mockImplementation(function* searchStreams() {
        // eslint-disable-next-line no-restricted-syntax
        for (const stream of streams) {
            yield stream
        }
    })
    const getAddressStub = jest.fn().mockImplementation(() => Promise.resolve({} as any))
    const useClientMock = useClient as any
    useClientMock.mockImplementation(() => ({
        searchStreams: searchStreamsStub,
        getAddress: getAddressStub,
    }))
    return searchStreamsStub
}

describe('usePublish', () => {
    let consoleMock = null
    beforeAll(() => {
        // don't show error as console.error
        consoleMock = jest.spyOn(console, 'error')
        consoleMock.mockImplementation((...args) => console.warn(...args))
    })
    afterEach(() => {
        jest.clearAllMocks()
        jest.restoreAllMocks()
    })
    afterAll(() => {
        consoleMock.mockRestore()
    })
    describe('publish mode', () => {
        it('throws an error if there is no product', async () => {
            let publish

            function Test() {
                publish = usePublish()
                return null
            }

            mount(<Test />)
            await act(async () => {
                try {
                    await publish()
                    expect(true).toBe(false) // shouldn't come here
                } catch (e) {
                    expect(e).toBeTruthy()
                    expect(e.message).toBe('no product')
                }
            })
        })
        it('sets unpublish mode if no pending changes', async () => {
            let publish

            function Test() {
                publish = usePublish()
                return null
            }

            mount(<Test />)
            const product = {
                id: '1',
                state: 'DEPLOYED',
                chain: 'ETHEREUM',
            }
            jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() => {
                throw new Error('no contract product')
            })
            jest.spyOn(dataUnionServices, 'getDataUnionOwner').mockImplementation(() => {
                throw new Error('no owner')
            })
            jest.spyOn(dataUnionServices, 'getAdminFee').mockImplementation(() => {
                throw new Error('no admin fee')
            })
            let result
            await act(async () => {
                result = await publish(product)
            })
            expect(result.mode).toBe(PublishMode.UNPUBLISH)
        })
        it('sets republish mode if there are pending changes', async () => {
            let publish

            function Test() {
                publish = usePublish()
                return null
            }

            mount(<Test />)
            const product = {
                id: '1',
                name: 'Old name',
                state: 'DEPLOYED',
                pendingChanges: {
                    name: 'New name',
                },
                chain: 'ETHEREUM',
            }
            jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() => {
                throw new Error('no contract product')
            })
            jest.spyOn(dataUnionServices, 'getDataUnionOwner').mockImplementation(() => {
                throw new Error('no owner')
            })
            jest.spyOn(dataUnionServices, 'getAdminFee').mockImplementation(() => {
                throw new Error('no admin fee')
            })
            let result
            await act(async () => {
                result = await publish(product)
            })
            expect(result.mode).toBe(PublishMode.REPUBLISH)
        })
        it('sets publish mode if not deployed & no contract product', async () => {
            let publish

            function Test() {
                publish = usePublish()
                return null
            }

            mount(<Test />)
            const product = {
                id: '1',
                name: 'Name',
                state: 'NOT_DEPLOYED',
                chain: 'ETHEREUM',
            }
            jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() => {
                throw new Error('no contract product')
            })
            jest.spyOn(dataUnionServices, 'getDataUnionOwner').mockImplementation(() => {
                throw new Error('no owner')
            })
            jest.spyOn(dataUnionServices, 'getAdminFee').mockImplementation(() => {
                throw new Error('no admin fee')
            })
            let result
            await act(async () => {
                result = await publish(product)
            })
            expect(result.mode).toBe(PublishMode.PUBLISH)
        })
        it('sets redeploy mode if not deployed & contract product', async () => {
            let publish

            function Test() {
                publish = usePublish()
                return null
            }

            mount(<Test />)
            const product = {
                id: '1',
                name: 'Name',
                state: 'NOT_DEPLOYED',
                chain: 'ETHEREUM',
            }
            jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() =>
                Promise.resolve({
                    id: '1',
                } as any),
            )
            jest.spyOn(dataUnionServices, 'getDataUnionOwner').mockImplementation(() => {
                throw new Error('no owner')
            })
            jest.spyOn(dataUnionServices, 'getAdminFee').mockImplementation(() => {
                throw new Error('no admin fee')
            })
            let result
            await act(async () => {
                result = await publish(product)
            })
            expect(result.mode).toBe(PublishMode.REDEPLOY)
        })
        it('throws an error if unknown product state', async () => {
            let publish

            function Test() {
                publish = usePublish()
                return null
            }

            mount(<Test />)
            jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() => {
                throw new Error('no owner')
            })
            jest.spyOn(dataUnionServices, 'getDataUnionOwner').mockImplementation(() => {
                throw new Error('no owner')
            })
            jest.spyOn(dataUnionServices, 'getAdminFee').mockImplementation(() => {
                throw new Error('no admin fee')
            })
            let result
            await act(async () => {
                try {
                    result = await publish({
                        id: '1',
                        name: 'Name',
                        state: 'DEPLOYING',
                        chain: 'ETHEREUM',
                    })
                    expect(true).toBe(false) // shouldn't come here
                } catch (e) {
                    expect(e).toBeTruthy()
                    expect(e.message).toBe('Invalid product state')
                }
            })
            expect(result).toBeFalsy()
            await act(async () => {
                try {
                    result = await publish({
                        id: '1',
                        name: 'Name',
                        state: 'UNDEPLOYING',
                        chain: 'ETHEREUM',
                    })
                    expect(true).toBe(false) // shouldn't come here
                } catch (e) {
                    expect(e).toBeTruthy()
                    expect(e.message).toBe('Invalid product state')
                }
            })
            expect(result).toBeFalsy()
        })
    })
    describe('publish actions', () => {
        describe('free data product', () => {
            it('publishes an unpublished free data product', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const result = await publish({
                    id: '1',
                    name: 'Name',
                    state: 'NOT_DEPLOYED',
                    chain: 'ETHEREUM',
                })
                expect(result.mode).toBe(PublishMode.PUBLISH)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([actionsTypes.PUBLISH_FREE])
                expect(result.queue.needsWeb3()).toBe(false)
                expect(result.queue.needsOwner()).toStrictEqual([])
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                jest.spyOn(productServices, 'postDeployFree').mockImplementation(() => Promise.resolve({} as any))
                await result.queue.start()
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_FREE)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_FREE, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_FREE)
                expect(finishFn).toHaveBeenCalled()
            })
            it('gives an error if postDeployFree fails', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const result = await publish({
                    id: '1',
                    name: 'Name',
                    state: 'NOT_DEPLOYED',
                    chain: 'ETHEREUM',
                })
                expect(result.mode).toBe(PublishMode.PUBLISH)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([actionsTypes.PUBLISH_FREE])
                expect(result.queue.needsWeb3()).toBe(false)
                expect(result.queue.needsOwner()).toStrictEqual([])
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const error = new Error('something happened')
                jest.spyOn(productServices, 'postDeployFree').mockImplementation(() => {
                    throw error
                })
                await result.queue.start()
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_FREE)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_FREE, transactionStates.FAILED, error)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_FREE)
                expect(finishFn).toHaveBeenCalled()
            })
            it('unpublishes a published free data product', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const product = {
                    id: '1',
                    name: 'Name',
                    state: 'DEPLOYED',
                    chain: 'ETHEREUM',
                }
                let result
                await act(async () => {
                    result = await publish(product)
                })
                expect(result.mode).toBe(PublishMode.UNPUBLISH)
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([actionsTypes.UNPUBLISH_FREE])
                expect(result.queue.needsWeb3()).toBe(false)
                expect(result.queue.needsOwner()).toStrictEqual([])
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                jest.spyOn(productServices, 'postUndeployFree').mockImplementation(() => Promise.resolve({} as any))
                await result.queue.start()
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.UNPUBLISH_FREE)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UNPUBLISH_FREE, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.UNPUBLISH_FREE)
                expect(finishFn).toHaveBeenCalled()
            })
            it('gives an error if postUndeployFree throws an error', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const product = {
                    id: '1',
                    name: 'Name',
                    state: 'DEPLOYED',
                    chain: 'ETHEREUM',
                }
                let result
                await act(async () => {
                    result = await publish(product)
                })
                expect(result.mode).toBe(PublishMode.UNPUBLISH)
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([actionsTypes.UNPUBLISH_FREE])
                expect(result.queue.needsWeb3()).toBe(false)
                expect(result.queue.needsOwner()).toStrictEqual([])
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const error = new Error('something happened')
                jest.spyOn(productServices, 'postUndeployFree').mockImplementation(() => {
                    throw error
                })
                await result.queue.start()
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.UNPUBLISH_FREE)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UNPUBLISH_FREE, transactionStates.FAILED, error)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.UNPUBLISH_FREE)
                expect(finishFn).toHaveBeenCalled()
            })
            it('republishes a published free data product with pending changes', async () => {
                const searchStreamsStub = stubStreams([
                    {
                        id: '1',
                    },
                    {
                        id: '2',
                    },
                    {
                        id: '3',
                    },
                    {
                        id: '4',
                    },
                ])
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const product = {
                    id: '1',
                    name: 'Name',
                    description: 'Description',
                    streams: ['1', '3'],
                    state: 'DEPLOYED',
                    pendingChanges: {
                        name: 'New name',
                        streams: ['2', '3', '4'],
                    },
                    chain: 'ETHEREUM',
                }
                let result
                await act(async () => {
                    result = await publish(product)
                })
                expect(result.mode).toBe(PublishMode.REPUBLISH)
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.PUBLISH_PENDING_CHANGES,
                ])
                expect(result.queue.needsWeb3()).toBe(false)
                expect(result.queue.needsOwner()).toStrictEqual([])
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const putProductStub = jest
                    .spyOn(productServices, 'putProduct')
                    .mockImplementation(() => Promise.resolve({} as any))
                await result.queue.start()
                expect(searchStreamsStub).toHaveBeenCalled()
                expect(putProductStub).toBeCalledWith(
                    {
                        id: '1',
                        name: 'New name',
                        description: 'Description',
                        streams: ['2', '3', '4'],
                        pendingChanges: undefined,
                        chain: 'ETHEREUM',
                    },
                    '1',
                )
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES)
                expect(finishFn).toHaveBeenCalled()
            })
            it('removes streams from pending changes that do not exist', async () => {
                const searchStreamsStub = stubStreams([
                    {
                        id: '1',
                    },
                    {
                        id: '2',
                    },
                ])
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const product = {
                    id: '1',
                    name: 'Name',
                    description: 'Description',
                    streams: ['1', '3'],
                    state: 'DEPLOYED',
                    pendingChanges: {
                        name: 'New name',
                        streams: ['2', '3', '4'],
                    },
                    chain: 'ETHEREUM',
                }
                let result
                await act(async () => {
                    result = await publish(product)
                })
                expect(result.mode).toBe(PublishMode.REPUBLISH)
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.PUBLISH_PENDING_CHANGES,
                ])
                expect(result.queue.needsWeb3()).toBe(false)
                expect(result.queue.needsOwner()).toStrictEqual([])
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const putProductStub = jest
                    .spyOn(productServices, 'putProduct')
                    .mockImplementation(() => Promise.resolve({} as any))
                await result.queue.start()
                expect(putProductStub).toBeCalledWith(
                    {
                        id: '1',
                        name: 'New name',
                        description: 'Description',
                        streams: ['2'],
                        pendingChanges: undefined,
                        chain: 'ETHEREUM',
                    },
                    '1',
                )
                expect(searchStreamsStub).toHaveBeenCalled()
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES)
                expect(finishFn).toHaveBeenCalled()
            })
        })
        describe('paid data product', () => {
            it('publishes an unpublished paid data product', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const result = await publish({
                    id: '1',
                    name: 'Name',
                    state: 'NOT_DEPLOYED',
                    isFree: false,
                    pricePerSecond: '1',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    chain: 'ETHEREUM',
                })
                expect(result.mode).toBe(PublishMode.PUBLISH)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.CREATE_CONTRACT_PRODUCT,
                ])
                expect(result.queue.needsWeb3()).toBe(true)
                expect(result.queue.needsOwner()).toStrictEqual([])
                const emitter = new EventEmitter()
                const tx = new Transaction(emitter)
                const hash = 'test'
                const receipt = {
                    transactionHash: hash,
                }
                const createContractProductStub = jest
                    .spyOn(contractProductServices, 'createContractProduct')
                    .mockImplementation(() => tx)
                const postSetDeployingStub = jest
                    .spyOn(productServices, 'postSetDeploying')
                    .mockImplementation(() => Promise.resolve({} as any))
                const putProductStub = jest
                    .spyOn(productServices, 'putProduct')
                    .mockImplementation(() => Promise.resolve({} as any))
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                const txPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        emitter.emit('transactionHash', hash)
                    }, 200)
                    setTimeout(() => {
                        emitter.emit('receipt', receipt)
                        resolve()
                    }, 400)
                })
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                await Promise.all([txPromise, result.queue.start()])
                expect(postSetDeployingStub).toBeCalledWith('1', 'test')
                expect(createContractProductStub.mock.calls[0][0]).toMatchObject({
                    id: '1',
                    name: 'Name',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    pricePerSecond: '1',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    state: 'NOT_DEPLOYED',
                    ownerAddress: '',
                    requiresWhitelist: undefined,
                })
                expect(putProductStub).not.toBeCalled()
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.CREATE_CONTRACT_PRODUCT)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.CREATE_CONTRACT_PRODUCT, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.CREATE_CONTRACT_PRODUCT, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.CREATE_CONTRACT_PRODUCT)
                expect(finishFn).toHaveBeenCalled()
            })
            it('publishes an unpublished paid data product with whitelist enabled', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const result = await publish({
                    id: '1',
                    name: 'Name',
                    state: 'NOT_DEPLOYED',
                    isFree: false,
                    pricePerSecond: '1',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    chain: 'ETHEREUM',
                    pendingChanges: {
                        requiresWhitelist: true,
                        pricingTokenAddress: '0x8f693ca8D21b157107184d29D398A8D082b38b76', // DATA
                    },
                })
                expect(result.mode).toBe(PublishMode.PUBLISH)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.CREATE_CONTRACT_PRODUCT,
                ])
                expect(result.queue.needsWeb3()).toBe(true)
                expect(result.queue.needsOwner()).toStrictEqual([])
                const emitter = new EventEmitter()
                const tx = new Transaction(emitter)
                const hash = 'test'
                const receipt = {
                    transactionHash: hash,
                }
                const createContractProductStub = jest
                    .spyOn(contractProductServices, 'createContractProduct')
                    .mockImplementation(() => tx)
                const postSetDeployingStub = jest
                    .spyOn(productServices, 'postSetDeploying')
                    .mockImplementation(() => Promise.resolve({} as any))
                const putProductStub = jest
                    .spyOn(productServices, 'putProduct')
                    .mockImplementation(() => Promise.resolve({} as any))
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                const txPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        emitter.emit('transactionHash', hash)
                    }, 200)
                    setTimeout(() => {
                        emitter.emit('receipt', receipt)
                        resolve()
                    }, 400)
                })
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                await Promise.all([txPromise, result.queue.start()])
                expect(postSetDeployingStub).toBeCalledWith('1', 'test')
                expect(createContractProductStub.mock.calls[0][0]).toMatchObject({
                    id: '1',
                    name: 'Name',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    pricePerSecond: '1',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    state: 'NOT_DEPLOYED',
                    ownerAddress: '',
                    requiresWhitelist: true,
                    pricingTokenAddress: '0x8f693ca8D21b157107184d29D398A8D082b38b76',
                })
                expect(putProductStub).not.toBeCalled()
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.CREATE_CONTRACT_PRODUCT)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.CREATE_CONTRACT_PRODUCT, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.CREATE_CONTRACT_PRODUCT, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.CREATE_CONTRACT_PRODUCT)
                expect(finishFn).toHaveBeenCalled()
            })
            it('unpublishes a published paid data product', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() =>
                    Promise.resolve({
                        id: '1',
                        pricePerSecond: '1',
                        ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                        beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                        priceCurrency: 'DATA',
                        minimumSubscriptionInSeconds: '0',
                    } as any),
                )
                const result = await publish({
                    id: '1',
                    name: 'Name',
                    state: 'DEPLOYED',
                    isFree: false,
                    pricePerSecond: '1',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    chain: 'ETHEREUM',
                })
                expect(result.mode).toBe(PublishMode.UNPUBLISH)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.UNDEPLOY_CONTRACT_PRODUCT,
                ])
                expect(result.queue.needsWeb3()).toBe(true)
                expect(result.queue.needsOwner()).toStrictEqual(['0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'])
                const emitter = new EventEmitter()
                const tx = new Transaction(emitter)
                const hash = 'test'
                const receipt = {
                    transactionHash: hash,
                }
                jest.spyOn(contractProductServices, 'deleteProduct').mockImplementation(() => tx)
                const postSetUndeployingStub = jest
                    .spyOn(productServices, 'postSetUndeploying')
                    .mockImplementation(() => Promise.resolve({} as any))
                const addTransactionStub = jest.spyOn(transactionActions, 'addTransaction')
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const txPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        emitter.emit('transactionHash', hash)
                    }, 200)
                    setTimeout(() => {
                        emitter.emit('receipt', receipt)
                        resolve()
                    }, 400)
                })
                await Promise.all([txPromise, result.queue.start()])
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.UNDEPLOY_CONTRACT_PRODUCT)
                expect(postSetUndeployingStub).toBeCalledWith('1', 'test')
                expect(addTransactionStub).toBeCalledWith(hash, transactionTypes.UNDEPLOY_PRODUCT)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UNDEPLOY_CONTRACT_PRODUCT, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(
                    actionsTypes.UNDEPLOY_CONTRACT_PRODUCT,
                    transactionStates.CONFIRMED,
                )
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.UNDEPLOY_CONTRACT_PRODUCT)
                expect(finishFn).toHaveBeenCalled()
            })
            it('redeploys an unpublished paid data product that has a contract product', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() =>
                    Promise.resolve({
                        id: '1',
                        pricePerSecond: '1',
                        ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                        beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                        priceCurrency: 'DATA',
                        minimumSubscriptionInSeconds: '0',
                    } as any),
                )
                const result = await publish({
                    id: '1',
                    name: 'Name',
                    state: 'NOT_DEPLOYED',
                    isFree: false,
                    pricePerSecond: '1',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    chain: 'ETHEREUM',
                })
                expect(result.mode).toBe(PublishMode.REDEPLOY)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([actionsTypes.REDEPLOY_PAID])
                expect(result.queue.needsWeb3()).toBe(true)
                expect(result.queue.needsOwner()).toStrictEqual(['0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'])
                const emitter = new EventEmitter()
                const tx = new Transaction(emitter)
                const hash = 'test'
                const receipt = {
                    transactionHash: hash,
                }
                jest.spyOn(contractProductServices, 'redeployProduct').mockImplementation(() => tx)
                const postSetDeployingStub = jest
                    .spyOn(productServices, 'postSetDeploying')
                    .mockImplementation(() => Promise.resolve({} as any))
                const addTransactionStub = jest.spyOn(transactionActions, 'addTransaction')
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const txPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        emitter.emit('transactionHash', hash)
                    }, 200)
                    setTimeout(() => {
                        emitter.emit('receipt', receipt)
                        resolve()
                    }, 400)
                })
                await Promise.all([txPromise, result.queue.start()])
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.REDEPLOY_PAID)
                expect(postSetDeployingStub).toBeCalledWith('1', 'test')
                expect(addTransactionStub).toBeCalledWith(hash, transactionTypes.REDEPLOY_PRODUCT)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.REDEPLOY_PAID, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.REDEPLOY_PAID, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.REDEPLOY_PAID)
                expect(finishFn).toHaveBeenCalled()
            })
            it('redeploys & updates contract info on an unpublished paid data product that has a contract product', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const contractProduct = {
                    id: '1',
                    pricePerSecond: '2',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                }
                jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() =>
                    Promise.resolve(contractProduct as any),
                )
                const product = {
                    id: '1',
                    name: 'Name',
                    state: 'NOT_DEPLOYED',
                    isFree: false,
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    pricePerSecond: '2',
                    beneficiaryAddress: '0x7Ce38183F7851EE6eEB9547B1E537fB362C79C10',
                    chain: 'ETHEREUM',
                }
                const result = await publish(product)
                expect(result.mode).toBe(PublishMode.REDEPLOY)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.UPDATE_CONTRACT_PRODUCT,
                ])
                expect(result.queue.needsWeb3()).toBe(true)
                expect(result.queue.needsOwner()).toStrictEqual(['0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'])
                const emitter1 = new EventEmitter()
                const tx1 = new Transaction(emitter1)
                const hash1 = 'test'
                const receipt1 = {
                    transactionHash: hash1,
                }
                const updateContractStub = jest
                    .spyOn(contractProductServices, 'updateContractProduct')
                    .mockImplementation(() => tx1)
                const addTransactionStub = jest.spyOn(transactionActions, 'addTransaction')
                const postSetDeployingStub = jest
                    .spyOn(productServices, 'postSetDeploying')
                    .mockImplementation(() => Promise.resolve({} as any))
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const txPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        emitter1.emit('transactionHash', hash1)
                    }, 200)
                    setTimeout(() => {
                        emitter1.emit('receipt', receipt1)
                        resolve()
                    }, 400)
                })
                await Promise.all([txPromise, result.queue.start()])
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT)
                expect(startedFn).not.toHaveBeenCalledWith(actionsTypes.REDEPLOY_PAID)
                expect(updateContractStub.mock.calls[0][0]).toMatchObject({
                    ...contractProduct,
                    pricePerSecond: product.pricePerSecond,
                    beneficiaryAddress: product.beneficiaryAddress,
                    priceCurrency: product.priceCurrency,
                })
                expect(postSetDeployingStub).toBeCalledWith('1', 'test')
                expect(addTransactionStub).toBeCalledWith(hash1, transactionTypes.UPDATE_CONTRACT_PRODUCT)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT)
                expect(finishFn).toHaveBeenCalled()
            })
            it('gives an error if contract update throws an error before starting', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const contractProduct = {
                    id: '1',
                    pricePerSecond: '2',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                }
                jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() =>
                    Promise.resolve(contractProduct as any),
                )
                const product = {
                    id: '1',
                    name: 'Name',
                    state: 'NOT_DEPLOYED',
                    isFree: false,
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    pricePerSecond: '2',
                    beneficiaryAddress: '0x7Ce38183F7851EE6eEB9547B1E537fB362C79C10',
                    chain: 'ETHEREUM',
                }
                const result = await publish(product)
                expect(result.mode).toBe(PublishMode.REDEPLOY)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.UPDATE_CONTRACT_PRODUCT,
                ])
                expect(result.queue.needsWeb3()).toBe(true)
                expect(result.queue.needsOwner()).toStrictEqual(['0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'])
                const updateError = new Error('update failed')
                const updateContractStub = jest
                    .spyOn(contractProductServices, 'updateContractProduct')
                    .mockImplementation(() => {
                        throw updateError
                    })
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                await result.queue.start()
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT)
                expect(updateContractStub.mock.calls[0][0]).toMatchObject({
                    ...contractProduct,
                    pricePerSecond: product.pricePerSecond,
                    beneficiaryAddress: product.beneficiaryAddress,
                    priceCurrency: product.priceCurrency,
                })
                expect(statusFn).toHaveBeenCalledWith(
                    actionsTypes.UPDATE_CONTRACT_PRODUCT,
                    transactionStates.FAILED,
                    updateError,
                )
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT)
                expect(finishFn).toHaveBeenCalled()
            })
            it('republishes a published paid data product that has no pending contract changes', async () => {
                const searchStreamsStub = stubStreams([
                    {
                        id: '1',
                    },
                    {
                        id: '2',
                    },
                    {
                        id: '3',
                    },
                    {
                        id: '4',
                    },
                ])
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() =>
                    Promise.resolve({
                        id: '1',
                        pricePerSecond: '1',
                        ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                        beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                        priceCurrency: 'DATA',
                        minimumSubscriptionInSeconds: '0',
                    } as any),
                )
                const putProductStub = jest
                    .spyOn(productServices, 'putProduct')
                    .mockImplementation(() => Promise.resolve({} as any))
                const result = await publish({
                    id: '1',
                    name: 'Name',
                    streams: ['1', '3'],
                    state: 'DEPLOYED',
                    isFree: false,
                    pricePerSecond: '1',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    pendingChanges: {
                        name: 'New name',
                        streams: ['2', '3', '4'],
                    },
                    chain: 'ETHEREUM',
                })
                expect(result.mode).toBe(PublishMode.REPUBLISH)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.PUBLISH_PENDING_CHANGES,
                ])
                expect(result.queue.needsWeb3()).toBe(false)
                expect(result.queue.needsOwner()).toStrictEqual([])
                const emitter = new EventEmitter()
                const tx = new Transaction(emitter)
                const hash = 'test'
                const receipt = {
                    transactionHash: hash,
                }
                jest.spyOn(contractProductServices, 'redeployProduct').mockImplementation(() => tx)
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const txPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        emitter.emit('transactionHash', hash)
                    }, 200)
                    setTimeout(() => {
                        emitter.emit('receipt', receipt)
                        resolve()
                    }, 400)
                })
                await Promise.all([txPromise, result.queue.start()])
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES)
                expect(searchStreamsStub).toHaveBeenCalled()
                expect(putProductStub.mock.calls[0][0]).toMatchObject({
                    id: '1',
                    name: 'New name',
                    streams: ['2', '3', '4'],
                    isFree: false,
                    pricePerSecond: '1',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    pendingChanges: undefined,
                    chain: 'ETHEREUM',
                })
                expect(finishFn).toHaveBeenCalled()
            })
            it('republishes a published paid data product that also has pending contract changes', async () => {
                const searchStreamsStub = stubStreams([
                    {
                        id: '1',
                    },
                    {
                        id: '2',
                    },
                    {
                        id: '3',
                    },
                    {
                        id: '4',
                    },
                ])
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const contractProduct = {
                    id: '1',
                    pricePerSecond: '1',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                }
                jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() =>
                    Promise.resolve(contractProduct as any),
                )
                const putProductStub = jest
                    .spyOn(productServices, 'putProduct')
                    .mockImplementation(() => Promise.resolve({} as any))
                const emitter = new EventEmitter()
                const tx = new Transaction(emitter)
                const hash = 'test'
                const receipt = {
                    transactionHash: hash,
                }
                const updateContractStub = jest
                    .spyOn(contractProductServices, 'updateContractProduct')
                    .mockImplementation(() => tx)
                const addTransactionStub = jest.spyOn(transactionActions, 'addTransaction')
                const product = {
                    id: '1',
                    name: 'Name',
                    streams: ['1', '3'],
                    state: 'DEPLOYED',
                    isFree: false,
                    pricePerSecond: '1',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    pendingChanges: {
                        pricePerSecond: '2',
                        beneficiaryAddress: '0x7Ce38183F7851EE6eEB9547B1E537fB362C79C10',
                        priceCurrency: 'EUR',
                        name: 'New name',
                        streams: ['2', '3', '4'],
                    },
                    chain: 'ETHEREUM',
                }
                const result = await publish(product)
                expect(result.mode).toBe(PublishMode.REPUBLISH)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.PUBLISH_PENDING_CHANGES,
                    actionsTypes.UPDATE_CONTRACT_PRODUCT,
                ])
                expect(result.queue.needsWeb3()).toBe(true)
                expect(result.queue.needsOwner()).toStrictEqual(['0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'])
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const txPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        emitter.emit('transactionHash', hash)
                    }, 200)
                    setTimeout(() => {
                        emitter.emit('receipt', receipt)
                        resolve()
                    }, 400)
                })
                await Promise.all([txPromise, result.queue.start()])
                expect(updateContractStub.mock.calls[0][0]).toMatchObject({
                    ...contractProduct,
                    pricePerSecond: product.pendingChanges.pricePerSecond,
                    beneficiaryAddress: product.pendingChanges.beneficiaryAddress,
                    priceCurrency: product.pendingChanges.priceCurrency,
                })
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES)
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES, transactionStates.CONFIRMED)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT, transactionStates.CONFIRMED)
                expect(addTransactionStub).toBeCalledWith(hash, transactionTypes.UPDATE_CONTRACT_PRODUCT)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT)
                expect(searchStreamsStub).toHaveBeenCalled()
                expect(putProductStub.mock.calls[0][0]).toMatchObject({
                    id: '1',
                    name: 'New name',
                    streams: ['2', '3', '4'],
                    isFree: false,
                    pricePerSecond: '1',
                    // contract info will be updated by the backend watcher
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    pendingChanges: undefined,
                    chain: 'ETHEREUM',
                })
                expect(finishFn).toHaveBeenCalled()
            })
        })
        describe('paid data union', () => {
            it('publishes an unpublished paid data union', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                jest.spyOn(dataUnionServices, 'getAdminFee').mockImplementation(() => Promise.resolve('0.3'))
                jest.spyOn(dataUnionServices, 'getDataUnionOwner').mockImplementation(() =>
                    Promise.resolve('0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'),
                )
                const result = await publish({
                    id: '1',
                    name: 'Name',
                    state: 'NOT_DEPLOYED',
                    isFree: false,
                    pricePerSecond: '1',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    type: 'DATAUNION',
                    chain: 'ETHEREUM',
                })
                expect(result.mode).toBe(PublishMode.PUBLISH)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.CREATE_CONTRACT_PRODUCT,
                ])
                expect(result.queue.needsWeb3()).toBe(true)
                expect(result.queue.needsOwner()).toStrictEqual(['0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'])
                const emitter = new EventEmitter()
                const tx = new Transaction(emitter)
                const hash = 'test'
                const receipt = {
                    transactionHash: hash,
                }
                jest.spyOn(contractProductServices, 'createContractProduct').mockImplementation(() => tx)
                const postSetDeployingStub = jest
                    .spyOn(productServices, 'postSetDeploying')
                    .mockImplementation(() => Promise.resolve({} as any))
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const txPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        emitter.emit('transactionHash', hash)
                    }, 200)
                    setTimeout(() => {
                        emitter.emit('receipt', receipt)
                        resolve()
                    }, 400)
                })
                await Promise.all([txPromise, result.queue.start()])
                expect(postSetDeployingStub).toBeCalledWith('1', 'test')
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.CREATE_CONTRACT_PRODUCT)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.CREATE_CONTRACT_PRODUCT, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.CREATE_CONTRACT_PRODUCT, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.CREATE_CONTRACT_PRODUCT)
                expect(finishFn).toHaveBeenCalled()
            })
            it('unpublishes a published paid data union', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() =>
                    Promise.resolve({
                        id: '1',
                        pricePerSecond: '1',
                        ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                        beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                        priceCurrency: 'DATA',
                        minimumSubscriptionInSeconds: '0',
                        chainId: 1,
                    } as any),
                )
                jest.spyOn(dataUnionServices, 'getAdminFee').mockImplementation(() => Promise.resolve('0.3'))
                jest.spyOn(dataUnionServices, 'getDataUnionOwner').mockImplementation(() =>
                    Promise.resolve('0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'),
                )
                const emitter = new EventEmitter()
                const tx = new Transaction(emitter)
                const hash = 'test'
                const receipt = {
                    transactionHash: hash,
                }
                jest.spyOn(contractProductServices, 'deleteProduct').mockImplementation(() => tx)
                const postSetUndeployingStub = jest
                    .spyOn(productServices, 'postSetUndeploying')
                    .mockImplementation(() => Promise.resolve({} as any))
                const addTransactionStub = jest.spyOn(transactionActions, 'addTransaction')
                const result = await publish({
                    id: '1',
                    name: 'Name',
                    state: 'DEPLOYED',
                    isFree: false,
                    pricePerSecond: '1',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    type: 'DATAUNION',
                    chain: 'ETHEREUM',
                })
                expect(result.mode).toBe(PublishMode.UNPUBLISH)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.UNDEPLOY_CONTRACT_PRODUCT,
                ])
                expect(result.queue.needsWeb3()).toBe(true)
                expect(result.queue.needsOwner()).toStrictEqual(['0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'])
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const txPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        emitter.emit('transactionHash', hash)
                    }, 200)
                    setTimeout(() => {
                        emitter.emit('receipt', receipt)
                        resolve()
                    }, 400)
                })
                await Promise.all([txPromise, result.queue.start()])
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.UNDEPLOY_CONTRACT_PRODUCT)
                expect(postSetUndeployingStub).toBeCalledWith('1', 'test')
                expect(addTransactionStub).toBeCalledWith(hash, transactionTypes.UNDEPLOY_PRODUCT)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UNDEPLOY_CONTRACT_PRODUCT, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(
                    actionsTypes.UNDEPLOY_CONTRACT_PRODUCT,
                    transactionStates.CONFIRMED,
                )
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.UNDEPLOY_CONTRACT_PRODUCT)
                expect(finishFn).toHaveBeenCalled()
            })
            it('redeploys & updates contract info on an unpublished paid data union that has a contract product', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const contractProduct = {
                    id: '1',
                    pricePerSecond: '2',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                }
                jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() =>
                    Promise.resolve(contractProduct as any),
                )
                jest.spyOn(dataUnionServices, 'getAdminFee').mockImplementation(() => Promise.resolve('0.3'))
                jest.spyOn(dataUnionServices, 'getDataUnionOwner').mockImplementation(() =>
                    Promise.resolve('0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'),
                )
                const emitter1 = new EventEmitter()
                const tx1 = new Transaction(emitter1)
                const hash1 = 'test'
                const receipt1 = {
                    transactionHash: hash1,
                }
                const updateContractStub = jest
                    .spyOn(contractProductServices, 'updateContractProduct')
                    .mockImplementation(() => tx1)
                const addTransactionStub = jest.spyOn(transactionActions, 'addTransaction')
                const postSetDeployingStub = jest
                    .spyOn(productServices, 'postSetDeploying')
                    .mockImplementation(() => Promise.resolve({} as any))
                const product = {
                    id: '1',
                    name: 'Name',
                    state: 'NOT_DEPLOYED',
                    isFree: false,
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    pricePerSecond: '2',
                    beneficiaryAddress: '0x7Ce38183F7851EE6eEB9547B1E537fB362C79C10',
                    type: 'DATAUNION',
                    chain: 'ETHEREUM',
                }
                const result = await publish(product)
                expect(result.mode).toBe(PublishMode.REDEPLOY)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.UPDATE_CONTRACT_PRODUCT,
                ])
                expect(result.queue.needsWeb3()).toBe(true)
                expect(result.queue.needsOwner()).toStrictEqual(['0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'])
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const txPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        emitter1.emit('transactionHash', hash1)
                    }, 200)
                    setTimeout(() => {
                        emitter1.emit('receipt', receipt1)
                        resolve()
                    }, 400)
                })
                await Promise.all([txPromise, result.queue.start()])
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT)
                expect(updateContractStub.mock.calls[0][0]).toMatchObject({
                    ...contractProduct,
                    pricePerSecond: product.pricePerSecond,
                    beneficiaryAddress: product.beneficiaryAddress,
                    priceCurrency: product.priceCurrency,
                })
                expect(postSetDeployingStub).toBeCalledWith('1', 'test')
                expect(addTransactionStub).toBeCalledWith(hash1, transactionTypes.UPDATE_CONTRACT_PRODUCT)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT)
                expect(finishFn).toHaveBeenCalled()
            })
            it('redeploys & updates contract info, changes admin fee on an unpublished paid data union that has a contract product', async () => {
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const contractProduct = {
                    id: '1',
                    pricePerSecond: '2',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    chainId: 1,
                }
                jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() =>
                    Promise.resolve(contractProduct as any),
                )
                jest.spyOn(dataUnionServices, 'getAdminFee').mockImplementation(() => Promise.resolve('0.3'))
                jest.spyOn(dataUnionServices, 'getDataUnionOwner').mockImplementation(() =>
                    Promise.resolve('0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'),
                )
                const emitter1 = new EventEmitter()
                const tx1 = new Transaction(emitter1)
                const hash1 = 'test'
                const receipt1 = {
                    transactionHash: hash1,
                }
                const emitter2 = new EventEmitter()
                const tx2 = new Transaction(emitter2)
                const hash2 = 'test2'
                const receipt2 = {
                    transactionHash: hash2,
                }
                const setAdminFeeStub = jest.spyOn(dataUnionServices, 'setAdminFee').mockImplementation(() => tx1)
                const updateContractStub = jest
                    .spyOn(contractProductServices, 'updateContractProduct')
                    .mockImplementation(() => tx2)
                const addTransactionStub = jest.spyOn(transactionActions, 'addTransaction')
                const postSetDeployingStub = jest
                    .spyOn(productServices, 'postSetDeploying')
                    .mockImplementation(() => Promise.resolve({} as any))
                const product = {
                    id: '1',
                    name: 'Name',
                    state: 'NOT_DEPLOYED',
                    isFree: false,
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    pricePerSecond: '2',
                    beneficiaryAddress: '0x7Ce38183F7851EE6eEB9547B1E537fB362C79C10',
                    type: 'DATAUNION',
                    pendingChanges: {
                        adminFee: '0.2',
                    },
                    chain: 'ETHEREUM',
                }
                const result = await publish(product)
                expect(result.mode).toBe(PublishMode.REDEPLOY)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.UPDATE_ADMIN_FEE,
                    actionsTypes.UPDATE_CONTRACT_PRODUCT,
                ])
                expect(result.queue.needsWeb3()).toBe(true)
                expect(result.queue.needsOwner()).toStrictEqual(['0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'])
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const txPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        emitter1.emit('transactionHash', hash1)
                    }, 200)
                    setTimeout(() => {
                        emitter1.emit('receipt', receipt1)
                    }, 400)
                    setTimeout(() => {
                        emitter2.emit('transactionHash', hash2)
                    }, 600)
                    setTimeout(() => {
                        emitter2.emit('receipt', receipt2)
                        resolve()
                    }, 800)
                })
                await Promise.all([txPromise, result.queue.start()])
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.UPDATE_ADMIN_FEE)
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT)
                expect(setAdminFeeStub).toBeCalledWith(product.beneficiaryAddress, 1, product.pendingChanges.adminFee)
                expect(updateContractStub.mock.calls[0][0]).toMatchObject({
                    ...contractProduct,
                    pricePerSecond: product.pricePerSecond,
                    beneficiaryAddress: product.beneficiaryAddress,
                    priceCurrency: product.priceCurrency,
                })
                expect(postSetDeployingStub).toBeCalledWith('1', 'test2')
                expect(addTransactionStub).toBeCalledWith(hash1, transactionTypes.UPDATE_ADMIN_FEE)
                expect(addTransactionStub).toBeCalledWith(hash2, transactionTypes.UPDATE_CONTRACT_PRODUCT)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_ADMIN_FEE, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_ADMIN_FEE, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.UPDATE_ADMIN_FEE)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT)
                expect(finishFn).toHaveBeenCalled()
            })
            it('republishes a published data union that has a changed admin fee', async () => {
                const searchStreamsStub = stubStreams([
                    {
                        id: '1',
                    },
                    {
                        id: '2',
                    },
                    {
                        id: '3',
                    },
                    {
                        id: '4',
                    },
                ])
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const contractProduct = {
                    id: '1',
                    pricePerSecond: '1',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                }
                jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() =>
                    Promise.resolve(contractProduct as any),
                )
                jest.spyOn(dataUnionServices, 'getAdminFee').mockImplementation(() => Promise.resolve('0.3'))
                jest.spyOn(dataUnionServices, 'getDataUnionOwner').mockImplementation(() =>
                    Promise.resolve('0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'),
                )
                const emitter = new EventEmitter()
                const tx = new Transaction(emitter)
                const hash = 'test'
                const receipt = {
                    transactionHash: hash,
                }
                const setAdminFeeStub = jest.spyOn(dataUnionServices, 'setAdminFee').mockImplementation(() => tx)
                const putProductStub = jest
                    .spyOn(productServices, 'putProduct')
                    .mockImplementation(() => Promise.resolve({} as any))
                const addTransactionStub = jest.spyOn(transactionActions, 'addTransaction')
                const product = {
                    id: '1',
                    name: 'Name',
                    streams: ['1', '3'],
                    state: 'DEPLOYED',
                    isFree: false,
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    pricePerSecond: '1',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    type: 'DATAUNION',
                    pendingChanges: {
                        name: 'New name',
                        adminFee: '0.5',
                        streams: ['2', '3', '4'],
                    },
                    chain: 'ETHEREUM',
                }
                const result = await publish(product)
                expect(result.mode).toBe(PublishMode.REPUBLISH)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.PUBLISH_PENDING_CHANGES,
                    actionsTypes.UPDATE_ADMIN_FEE,
                ])
                expect(result.queue.needsWeb3()).toBe(true)
                expect(result.queue.needsOwner()).toStrictEqual(['0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'])
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const txPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        emitter.emit('transactionHash', hash)
                    }, 200)
                    setTimeout(() => {
                        emitter.emit('receipt', receipt)
                        resolve()
                    }, 400)
                })
                await Promise.all([txPromise, result.queue.start()])
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES)
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.UPDATE_ADMIN_FEE)
                expect(searchStreamsStub).toHaveBeenCalled()
                expect(putProductStub).toBeCalledWith(
                    {
                        id: '1',
                        name: 'New name',
                        streams: ['2', '3', '4'],
                        isFree: false,
                        ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                        priceCurrency: 'DATA',
                        minimumSubscriptionInSeconds: '0',
                        pricePerSecond: '1',
                        beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                        type: 'DATAUNION',
                        pendingChanges: undefined,
                        chain: 'ETHEREUM',
                    },
                    '1',
                )
                expect(setAdminFeeStub).toBeCalledWith('0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0', 1, '0.5')
                expect(addTransactionStub).toBeCalledWith(hash, transactionTypes.UPDATE_ADMIN_FEE)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_ADMIN_FEE, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_ADMIN_FEE, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.UPDATE_ADMIN_FEE)
                expect(finishFn).toHaveBeenCalled()
            })
            it('republishes a published data union that has a changed admin fee & contract data', async () => {
                const searchStreamsStub = stubStreams([
                    {
                        id: '1',
                    },
                    {
                        id: '2',
                    },
                    {
                        id: '3',
                    },
                    {
                        id: '4',
                    },
                ])
                let publish

                function Test() {
                    publish = usePublish()
                    return null
                }

                mount(<Test />)
                const contractProduct = {
                    id: '1',
                    pricePerSecond: '1',
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                }
                jest.spyOn(contractProductServices, 'getProductFromContract').mockImplementation(() =>
                    Promise.resolve(contractProduct as any),
                )
                jest.spyOn(dataUnionServices, 'getAdminFee').mockImplementation(() => Promise.resolve('0.3'))
                jest.spyOn(dataUnionServices, 'getDataUnionOwner').mockImplementation(() =>
                    Promise.resolve('0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'),
                )
                const emitter1 = new EventEmitter()
                const tx1 = new Transaction(emitter1)
                const hash1 = 'test1'
                const receipt1 = {
                    transactionHash: hash1,
                }
                const emitter2 = new EventEmitter()
                const tx2 = new Transaction(emitter2)
                const hash2 = 'test2'
                const receipt2 = {
                    transactionHash: hash2,
                }
                const setAdminFeeStub = jest.spyOn(dataUnionServices, 'setAdminFee').mockImplementation(() => tx1)
                const updateContractStub = jest
                    .spyOn(contractProductServices, 'updateContractProduct')
                    .mockImplementation(() => tx2)
                const putProductStub = jest
                    .spyOn(productServices, 'putProduct')
                    .mockImplementation(() => Promise.resolve({} as any))
                const addTransactionStub = jest.spyOn(transactionActions, 'addTransaction')
                const product = {
                    id: '1',
                    name: 'Name',
                    streams: ['1', '3'],
                    state: 'DEPLOYED',
                    isFree: false,
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    pricePerSecond: '1',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    type: 'DATAUNION',
                    pendingChanges: {
                        name: 'New name',
                        adminFee: '0.5',
                        streams: ['2', '3', '4'],
                        pricePerSecond: '2',
                        beneficiaryAddress: '0x7Ce38183F7851EE6eEB9547B1E537fB362C79C10',
                        priceCurrency: 'EUR',
                    },
                    chain: 'ETHEREUM',
                }
                const result = await publish(product)
                expect(result.mode).toBe(PublishMode.REPUBLISH)
                expect(result.queue).toBeTruthy()
                expect(result.queue.getActions().map(({ id }) => id)).toStrictEqual([
                    actionsTypes.PUBLISH_PENDING_CHANGES,
                    actionsTypes.UPDATE_ADMIN_FEE,
                    actionsTypes.UPDATE_CONTRACT_PRODUCT,
                ])
                expect(result.queue.needsWeb3()).toBe(true)
                expect(result.queue.needsOwner()).toStrictEqual(['0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0'])
                const startedFn = jest.fn()
                const statusFn = jest.fn()
                const readyFn = jest.fn()
                const finishFn = jest.fn()
                result.queue
                    .subscribe('started', startedFn)
                    .subscribe('status', statusFn)
                    .subscribe('ready', readyFn)
                    .subscribe('finish', finishFn)
                const txPromise = new Promise<void>((resolve) => {
                    setTimeout(() => {
                        emitter1.emit('transactionHash', hash1)
                    }, 200)
                    setTimeout(() => {
                        emitter1.emit('receipt', receipt1)
                    }, 400)
                    setTimeout(() => {
                        emitter2.emit('transactionHash', hash2)
                    }, 600)
                    setTimeout(() => {
                        emitter2.emit('receipt', receipt2)
                        resolve()
                    }, 800)
                })
                await Promise.all([txPromise, result.queue.start()])
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES)
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.UPDATE_ADMIN_FEE)
                expect(startedFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT)
                expect(searchStreamsStub).toHaveBeenCalled()
                expect(putProductStub.mock.calls[0][0]).toMatchObject({
                    id: '1',
                    name: 'New name',
                    streams: ['2', '3', '4'],
                    isFree: false,
                    ownerAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    priceCurrency: 'DATA',
                    minimumSubscriptionInSeconds: '0',
                    pricePerSecond: '1',
                    beneficiaryAddress: '0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0',
                    type: 'DATAUNION',
                    pendingChanges: undefined,
                    chain: 'ETHEREUM',
                })
                expect(updateContractStub.mock.calls[0][0]).toMatchObject({
                    ...contractProduct,
                    pricePerSecond: product.pendingChanges.pricePerSecond,
                    beneficiaryAddress: product.pendingChanges.beneficiaryAddress,
                    priceCurrency: product.pendingChanges.priceCurrency,
                    chainId: 1,
                })
                expect(setAdminFeeStub).toBeCalledWith('0x4178baBE9E5148c6D5fd431cD72884B07Ad855a0', 1, '0.5')
                expect(addTransactionStub).toBeCalledWith(hash1, transactionTypes.UPDATE_ADMIN_FEE)
                expect(addTransactionStub).toBeCalledWith(hash2, transactionTypes.UPDATE_CONTRACT_PRODUCT)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.PUBLISH_PENDING_CHANGES)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_ADMIN_FEE, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_ADMIN_FEE, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.UPDATE_ADMIN_FEE)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT, transactionStates.PENDING)
                expect(statusFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT, transactionStates.CONFIRMED)
                expect(readyFn).toHaveBeenCalledWith(actionsTypes.UPDATE_CONTRACT_PRODUCT)
                expect(finishFn).toHaveBeenCalled()
            })
        })
    })
})
