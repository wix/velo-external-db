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

export const appendRoleToRequest = (role: string) => (dataRaw: string) => {
    const data = JSON.parse( dataRaw )
    return JSON.stringify({ request: data, metadata: { requestContext: { ...data.requestContext, role } } })
}

export const signTokenWith = (privateKey: string, appId: string, options = { algorithm: 'RS256' }) => (dataRaw: string, headers: AxiosRequestHeaders) => {
    headers['Content-Type'] = 'text/plain'
    const data = JSON.parse( dataRaw )
    const payload = {
        data,
        iss: TOKEN_ISSUER,
        aud: appId,
    }
    const signedData = jwt.sign(payload, privateKey, options as jwt.SignOptions)
    return signedData
}


export const authAdmin = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat(appendRoleToRequest('BACKEND_CODE'), signTokenWith(authConfig.authPrivateKey, authConfig.kid)) }

export const authOwner = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat(appendRoleToRequest('OWNER'), signTokenWith(authConfig.authPrivateKey, authConfig.kid)) }

export const authVisitor = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat(appendRoleToRequest('VISITOR'), signTokenWith(authConfig.authPrivateKey, authConfig.kid)) }

export const authOwnerWithoutJwt = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendRoleToRequest('OWNER') ) }

export const authOwnerWithWrongJwtPublicKey = { transformRequest: axios.defaults
                                        .transformRequest
                                        .concat( appendRoleToRequest('OWNER'), signTokenWith(authConfig.otherAuthPrivateKey, authConfig.kid) ) }

                                    
export const authOwnerWithWrongAppId= { transformRequest: axios.defaults
                                        .transformRequest
                                        .concat( appendRoleToRequest('OWNER'), signTokenWith(authConfig.authPrivateKey, 'wrong-app-id') ) }

                                    

export const errorResponseWith = (errorCode: any, message: string, httpStatusCode: number) => ({ response: { data: { data: { description: expect.stringContaining(message) }, errorCode  }, status: httpStatusCode } })

export const collectionChangeNotSupportedErrorResponseWith = (fieldsName: string[]) => ({ response: { data: { data: { errors: fieldsName.map(f => ({ fieldKey: f, message: expect.any(String) })) }, errorCode: 'COLLECTION_CHANGE_NOT_SUPPORTED' } } })

