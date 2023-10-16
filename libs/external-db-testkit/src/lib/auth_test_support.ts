import * as Chance from 'chance'
import { AxiosRequestHeaders } from 'axios'
import * as jwt from 'jsonwebtoken'
import { authConfig } from '@wix-velo/test-commons'

const chance = Chance()
const axios = require('axios').create({
    baseURL: 'http://localhost:8080',
})

const allowedMetasite = chance.word()
const externalDatabaseId = chance.word()

export const authInit = () => {
    process.env['ALLOWED_METASITES'] = allowedMetasite
    process.env['EXTERNAL_DATABASE_ID'] = externalDatabaseId
}

const appendRoleToRequest = (role: string) => (dataRaw: string) => {
    const data = JSON.parse( dataRaw )
    return JSON.stringify({ ...data, ...{ requestContext: { ...data.requestContext, role } } })
}

const appendJWTHeaderToRequest = (dataRaw: string, headers: AxiosRequestHeaders) => {
    headers['Authorization'] = createJwtHeader()
    const data = JSON.parse( dataRaw )
    return JSON.stringify({ ...data } )
}

const TOKEN_ISSUER = 'wix-data.wix.com'

const createJwtHeader = () => {
    const token = jwt.sign({ iss: TOKEN_ISSUER, siteId: allowedMetasite, aud: externalDatabaseId }, authConfig.authPrivateKey, { algorithm: 'ES256', keyid: authConfig.kid })
    return `Bearer ${token}`
}

export const authAdmin = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendJWTHeaderToRequest, appendRoleToRequest('BACKEND_CODE') ) }

export const authOwner = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendJWTHeaderToRequest, appendRoleToRequest('OWNER' ) ) }

export const authVisitor = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendJWTHeaderToRequest, appendRoleToRequest('VISITOR' ) ) }

export const authOwnerWithoutJwt = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendRoleToRequest('OWNER' ) ) }

export const errorResponseWith = (status: any, message: string) => ({ response: { data: { description: expect.stringContaining(message) }, status } })
