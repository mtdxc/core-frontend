import getConfig from '$app/src/getters/getConfig'
import setTempEnv from '$app/test/test-utils/setTempEnv'
import g from './getCoreConfig'
jest.mock('$app/src/getters/getConfig', () => ({
    __esModule: true,
    default: jest.fn(),
}))
describe('getCoreConfig', () => {
    it('when empty, returns defaults', () => {
        (getConfig as any).mockImplementation(() => ({}))
        expect(g()).toMatchObject({
            landingPageUrl: 'https://streamr.network',
            platformOriginUrl: undefined,
            streamrUrl: undefined,
        })
    })
    it('forwards custom core config fields', () => {
        (getConfig as any).mockImplementation(() => ({
            core: {
                custom: 'value',
            },
        }))
        expect(g().custom).toEqual('value')
    })
    describe('URL formatting', () => {
        setTempEnv({
            STREAMR_DOCKER_DEV_HOST: 'host',
        })
        it('formats selected URLs', () => {
            (getConfig as any).mockImplementation(() => ({
                core: {
                    landingPageUrl: '/lp',
                    platformOriginUrl: '/pf',
                    streamrUrl: '/sr',
                },
            }))
            expect(g()).toMatchObject({
                landingPageUrl: 'http://host/lp',
                platformOriginUrl: 'http://host/pf',
                streamrUrl: 'http://host/sr',
            })
        })
    })
})
