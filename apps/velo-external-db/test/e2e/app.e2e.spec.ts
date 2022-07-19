import { authOwner } from '../drivers/auth_test_support'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName } from '../resources/e2e_resources'

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


    afterAll(async() => await teardownApp())

})
