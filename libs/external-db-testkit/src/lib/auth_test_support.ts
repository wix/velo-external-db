import * as Chance from 'chance'

const chance = Chance()
const axios = require('axios').create({
    baseURL: 'http://localhost:8080',
})

const secretKey = chance.word()

export const authInit = () => {
    process.env['SECRET_KEY'] = secretKey
}

const appendSecretKeyToRequest = (dataRaw: string) => {
    const data = JSON.parse( dataRaw )
    return JSON.stringify({ ...data, ...{ requestContext: { settings: { secretKey: secretKey } } } })
}

const appendRoleToRequest = (role: string) => (dataRaw: string) => {
    const data = JSON.parse( dataRaw )
    return JSON.stringify({ ...data, ...{ requestContext: { ...data.requestContext, role: role } } })
}

export const authAdmin = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendSecretKeyToRequest, appendRoleToRequest('BACKEND_CODE') ) }

export const authOwner = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendSecretKeyToRequest, appendRoleToRequest('OWNER' ) ) }

export const authVisitor = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendSecretKeyToRequest, appendRoleToRequest('VISITOR' ) ) }

export const authOwnerWithoutSecretKey = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendRoleToRequest('OWNER' ) ) }

//@ts-ignore
export const errorResponseWith = (status: any, message: string) => ({ response: { data: { message: expect.stringContaining(message) }, status } })
