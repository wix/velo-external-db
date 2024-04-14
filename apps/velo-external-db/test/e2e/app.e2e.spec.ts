import { authOwner } from '@wix-velo/external-db-testkit'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName, env, supportedOperations } from '../resources/e2e_resources'
import { SchemaOperations } from '@wix-velo/velo-external-db-types'
import { givenHideAppInfoEnvIsTrue } from '../drivers/app_info_config_test_support'

const axios = require('axios').create({
    baseURL: 'http://localhost:8080/'
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
        expect((await axios.post('/v3/provision', { }, authOwner)).data).toEqual(expect.objectContaining({ protocolVersion: 3, vendor: 'azure' }))
    })

    test('answer app info with stub response', async() => {
        await givenHideAppInfoEnvIsTrue()
        const { data: appInfo } = await axios.get('/')

        Object.values(env.enviormentVariables).forEach(value => {
            expect(appInfo).not.toContain(value)
        })
    })
    test('answer capability', async() => {
                                  
        expect((await axios.post('/v3/capabilities/get', { }, authOwner)).data).toEqual(expect.objectContaining({
            supportsCollectionModifications: true,
            supportedFieldTypes: expect.toBeArray(),
            indexptions: {
                supportsIndexes: supportedOperations.includes(SchemaOperations.Indexing),
                maxNumberOfRegularIndexesPerCollection: 10,
                maxNumberOfUniqueIndexesPerCollection: 10,
                maxNumberOfIndexesPerCollection: 20,
            },
         }))
    })


    afterAll(async() => await teardownApp())

})
