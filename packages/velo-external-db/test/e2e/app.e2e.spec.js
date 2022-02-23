const { authOwner } = require('../drivers/auth_test_support')
const { initApp, teardownApp, dbTeardown } = require('../resources/e2e_resources')
const { name, setup } = require('../resources/e2e_resources').testedSuit()

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

describe(`Velo External DB: ${name}`,  () => {
    beforeAll(async() => {
        await setup()

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
