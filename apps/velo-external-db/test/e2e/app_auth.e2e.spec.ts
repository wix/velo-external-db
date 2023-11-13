import axios from 'axios'
import each from 'jest-each'
import { config } from '@wix-velo/velo-external-db-core'
import { authOwnerWithoutJwt, authOwnerWithWrongJwtPublicKey, authVisitor, authOwnerWithWrongAppId } from '@wix-velo/external-db-testkit'
import { initApp, teardownApp, dbTeardown, setupDb, currentDbImplementationName } from '../resources/e2e_resources'

const axiosInstance = axios.create({
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

    describe('Role authorization', () => {
        each(config.map(i => i.pathPrefix)).test('should throw 500 on a request to %s without the appropriate role', async(api) => {
            return expect(axiosInstance.post(api, {}, authVisitor)).rejects.toThrow('500')
        })
    })

    describe('JWT authorization', () => {
        test('should throw if the request is not singed with JWT token', async() => {
            return expect(axiosInstance.post('data/insert', {}, authOwnerWithoutJwt)).rejects.toThrow('500')
        })

        test('should throw if the request is singed with the wrong public key', async() => {
            return expect(axiosInstance.post('data/insert', {}, authOwnerWithWrongJwtPublicKey)).rejects.toThrow('500')
        })

        test('should throw if the request is signed with wrong app id', async() => {
            return expect(axiosInstance.post('data/insert', {}, authOwnerWithWrongAppId)).rejects.toThrow('500')
        })
    })

    afterAll(async() => await teardownApp())
})
