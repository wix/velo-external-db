const { authOwner } = require('../drivers/auth_test_support')
const each = require('jest-each').default
const { initApp, teardownApp, dbTeardown, testSuits } = require('../resources/e2e_resources')

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

describe('Velo External DB',  () => {
    each(testSuits()).describe('%s', (name, setup) => {
        beforeAll(async() => {
            await setup()

            await initApp()
        }, 20000)

        afterAll(async() => await dbTeardown(), 20000)

        test('answer default page with a welcoming response', async() => {
            expect((await axios.get('/')).data).toContain('<!doctype html>')
        })

        test('answer provision with stub response', async() => {
            expect((await axios.post('/provision', { }, authOwner)).data).toEqual(expect.objectContaining({ protocolVersion: 2, vendor: 'azr' }))
        })
    })

    afterAll(async() => await teardownApp())

})
