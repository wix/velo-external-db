const { Uninitialized, gen } = require('test-commons')
const { authVisitor } = require('../drivers/auth_test_support')
const each = require('jest-each').default
const { initApp, teardownApp, dbTeardown, testedSuit } = require('../resources/e2e_resources')



const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

describe(`Velo External DB authorization: ${testedSuit().name}`, () => {
    beforeAll(async() => {
        await testedSuit().setup()

        await initApp()
    }, 20000)

    afterAll(async() => {
        await dbTeardown()
    }, 20000)

    each(['data/find', 'data/aggregate', 'data/insert', 'data/insert/bulk', 'data/get', 'data/update',
          'data/update/bulk', 'data/remove', 'data/remove/bulk', 'data/count'])
    .test('should throw 401 on a request to %s without the appropriate role', async(api) => {
            return expect(() => axios.post(api, { collectionName: ctx.collectionName }, authVisitor)).rejects.toThrow('401')
    })

    const ctx = {
        collectionName: Uninitialized,
    }

    beforeEach(async() => {
        ctx.collectionName = gen.randomCollectionName()
    })

    afterAll(async() => await teardownApp())
})
