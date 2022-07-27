import { externalDbDeletme } from './external-db-deletme';
import * as mysql from '@wix-velo/external-db-mysql'
import { authOwner, E2EResources } from '@wix-velo/external-db-testkit'
import { main } from '../app'
const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
})

let env: E2EResources
describe('externalDbDeletme', () => {
    beforeAll(async () => {
        env = new E2EResources(mysql.testResources, main)
        await env.globalSetUp()
    })

    test('list', async () => {
        await expect(axios.post('/schemas/list', {}, authOwner)).resolves.toEqual(expect.objectContaining({
            data: {
                schemas: []
            }
        }))
    })

    afterAll(async () => {
        await env.globalTeardown()
    })
})
