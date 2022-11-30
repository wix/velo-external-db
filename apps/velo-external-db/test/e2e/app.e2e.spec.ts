import { authOwner } from '@wix-velo/external-db-testkit'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName } from '../resources/e2e_resources'

import { CollectionCapability } from '@wix-velo/velo-external-db-core'
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
        expect((await axios.post('/provision', { }, authOwner)).data).toEqual(expect.objectContaining({ protocolVersion: 3, vendor: 'azure' }))
    })

    test('answer capability', async() => {
                                  
        expect((await axios.get('/capabilities', { }, authOwner)).data).toEqual(expect.objectContaining({ 
            capabilities: {
                collection: [CollectionCapability.CREATE]
            }
         }))
    })


    afterAll(async() => await teardownApp())

})
