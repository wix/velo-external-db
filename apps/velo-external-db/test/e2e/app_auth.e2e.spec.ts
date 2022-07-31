import { Uninitialized, gen } from '@wix-velo/test-commons'
import { authVisitor, authOwnerWithoutSecretKey, errorResponseWith } from '@wix-velo/external-db-testkit'
import each from 'jest-each'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName } from '../resources/e2e_resources'



const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

describe(`Velo External DB authorization: ${currentDbImplementationName()}`, () => {
    beforeAll(async() => {
        await setupDb()

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

    test('wrong secretKey will throw an appropriate error with the right format', async() => {
        return expect(() => axios.post('/schemas/list', {}, authOwnerWithoutSecretKey)).rejects.toMatchObject(errorResponseWith(401, 'You are not authorized'))
    })

    const ctx = {
        collectionName: Uninitialized,
    }

    beforeEach(async() => {
        ctx.collectionName = gen.randomCollectionName()
    })

    afterAll(async() => await teardownApp())
})
