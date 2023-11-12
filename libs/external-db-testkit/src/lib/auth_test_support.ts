import { AxiosRequestHeaders } from 'axios'
import * as jwt from 'jsonwebtoken'
import { authConfig } from '@wix-velo/test-commons'

const axios = require('axios').create({
    baseURL: 'http://localhost:8080',
})

const TOKEN_ISSUER = 'wix.com'

export const authInit = () => {
    process.env['JWT_PUBLIC_KEY'] = authConfig.authPublicKey
    process.env['APP_DEF_ID'] = authConfig.kid
}

const appendRoleToRequest = (role: string) => (dataRaw: string) => {
    const data = JSON.parse( dataRaw )
    return JSON.stringify({ request: data, metadata: { requestContext: { ...data.requestContext, role } } })
}

const signTokenWith = (privateKey: string, options = { algorithm: 'RS256' }) => (dataRaw: string, headers: AxiosRequestHeaders) => {
    headers['Content-Type'] = 'text/plain'
    const data = JSON.parse( dataRaw )
    const payload = {
        data,
        iss: TOKEN_ISSUER,
        aud: process.env['APP_DEF_ID'],
    }
    const signedData = jwt.sign(payload, privateKey, options as jwt.SignOptions)
    return signedData
}


export const authAdmin = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat(appendRoleToRequest('BACKEND_CODE'), signTokenWith(authConfig.authPrivateKey)) }

export const authOwner = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat(appendRoleToRequest('OWNER'), signTokenWith(authConfig.authPrivateKey)) }

export const authVisitor = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat(appendRoleToRequest('VISITOR'), signTokenWith(authConfig.authPrivateKey)) }

export const authOwnerWithoutJwt = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendRoleToRequest('OWNER') ) }

export const errorResponseWith = (status: any, message: string) => ({ response: { data: { description: expect.stringContaining(message) }, status } })
