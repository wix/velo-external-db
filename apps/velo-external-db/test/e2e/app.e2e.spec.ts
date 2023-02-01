import { authOwner } from '@wix-velo/external-db-testkit'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, env } from '../resources/e2e_resources'
import { givenHideAppInfoEnvIsTrue } from '../drivers/app_info_config_test_support'

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

describe(`Velo External DB: ${currentDbImplementationName()}`,  () => {
    beforeAll(async() => {
        await setupDb()

        await initApp()
    }, 20000)

    afterAll(async() => await dbTeardown(), 20000)

    test('answer default page with a welcoming response', async() => {
        expect((await axios.get('/')).data).toContain('<!doctype html>')
    })

    test('answer provision with stub response', async() => {
        expect((await axios.post('/provision', { }, authOwner)).data).toEqual(expect.objectContaining({ protocolVersion: 2, vendor: 'azure' }))
    })

    if (currentDbImplementationName() !== 'google-sheet') {
        test('answer app info with stub response', async() => {
            givenHideAppInfoEnvIsTrue()
            const { data: appInfo } = await axios.get('/')

            Object.values(env.enviormentVariables).forEach(value => {
                expect(appInfo).not.toContain(value)
            })
        })
    }

    afterAll(async() => await teardownApp())

})
