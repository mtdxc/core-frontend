import React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import * as services from '$mp/modules/dataUnion/services'
import useDataUnionServerStats from '../useDataUnionServerStats'
jest.mock('$mp/modules/dataUnion/services')
jest.useFakeTimers()
const getDataUnionStatsMock = jest.fn().mockResolvedValue({
    totalEarnings: 123,
    memberCount: {
        total: 10,
        active: 5,
    },
})
describe('useDataUnionServerStats', () => {
    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {})
    })
    afterEach(() => {
        (services.getDataUnionStats as any).mockRestore()
        jest.clearAllTimers()
    })
    it('returns undefined earnings and member count by default', () => {
        let result

        function Test() {
            result = useDataUnionServerStats()
            return null
        }

        mount(<Test />)
        expect(result.totalEarnings).toStrictEqual(undefined)
        expect(result.memberCount).toStrictEqual(undefined)
    })
    it('throws an error if startPolling is called without id', () => {
        let result

        function Test() {
            result = useDataUnionServerStats()
            return null
        }

        mount(<Test />)
        expect(result.startPolling()).rejects.toThrow()
    })
    it('returns stats', async () => {
        let result

        function Test() {
            result = useDataUnionServerStats()
            return null
        }

        mount(<Test />);
        (services.getDataUnionStats as any).mockImplementation(getDataUnionStatsMock)
        await act(async () => {
            await result.startPolling('0x123', 8995)
        })
        expect(getDataUnionStatsMock).toBeCalledWith('0x123', 8995)
        expect(result.totalEarnings).toStrictEqual(123)
        expect(result.memberCount).toStrictEqual({
            total: 10,
            active: 5,
        })
    })
    it('throws an error if stats fetching fails with something other than 404 error', async () => {
        let result

        function Test() {
            result = useDataUnionServerStats()
            return null
        }

        mount(<Test />)
        const getDataUnionStatsMock = jest.fn(async () => {
            throw new Error('something happened')
        });
        (services.getDataUnionStats as any).mockImplementation(getDataUnionStatsMock)
        await act(async () => {
            try {
                await result.startPolling('0x123', 8995)
            } catch (e) {
                expect(e.message).toStrictEqual('something happened')
            }
        })
        expect(getDataUnionStatsMock).toBeCalledWith('0x123', 8995)
    })
    it('retries fetching if stats fetching fails with 404 error', async () => {
        let result

        function Test() {
            result = useDataUnionServerStats()
            return null
        }

        mount(<Test />)
        const getDataUnionStatsMock = jest.fn(async () => {
            const responseError = new Error('something happened');
            (responseError as any).statusCode = 404
            throw responseError
        });
        (services.getDataUnionStats as any).mockImplementation(getDataUnionStatsMock)
        await act(async () => {
            await result.startPolling('0x123', 8995)
        })
        jest.runAllTimers()
        expect(getDataUnionStatsMock).toBeCalledWith('0x123', 8995)
        expect(getDataUnionStatsMock).toHaveBeenCalledTimes(2)
    })
})
