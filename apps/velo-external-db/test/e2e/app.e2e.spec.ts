import { authOwner } from '@wix-velo/external-db-testkit'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, env } from '../resources/e2e_resources'
import { givenHideAppInfoEnvIsTrue } from '../drivers/app_info_config_test_support'

const axios = require('axios').create({
    baseURL: 'http://localhost:3000'
})

describe(`Velo External DB: ${currentDbImplementationName()}`,  () => {
    beforeAll(async() => {
        process.env.PORT = '3000'
        await setupDb()
        
        process.env.PORT = '3000'
        console.log({ port: process.env.PORT })
        
        await initApp()
        console.log({ port2: process.env.PORT })
    }, 20000)

    beforeEach(async() => {
        process.env.PORT = '3000'
    })

    afterAll(async() => await dbTeardown(), 20000)

    test('answer default page with a welcoming response', async() => {
        expect((await axios.get('/')).data).toContain('<!doctype html>')
    })

    test('answer provision with stub response', async() => {
        expect((await axios.post('/provision', { }, authOwner)).data).toEqual(expect.objectContaining({ protocolVersion: 2, vendor: 'azure' }))
    })

    test('answer app info with stub response', async() => {
        await givenHideAppInfoEnvIsTrue()
        const { data: appInfo } = await axios.get('/')

        Object.values(env.enviormentVariables).forEach(value => {
            expect(appInfo).not.toContain(value)
        })
    })

    afterAll(async() => {
        await teardownApp()
        delete process.env.PORT
    })

})
