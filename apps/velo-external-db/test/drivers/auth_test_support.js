const Chance = require('chance')
const chance = Chance()
const axios = require('axios').create({
    baseURL: 'http://localhost:8080',
})

const secretKey = chance.word()

const authInit = () => {
    process.env.SECRET_KEY = secretKey
}

const appendSecretKeyToRequest = dataRaw => {
    const data = JSON.parse( dataRaw )
    return JSON.stringify({ ...data, ...{ requestContext: { settings: { secretKey: secretKey } } } })
}

const appendRoleToRequest = role => dataRaw => {
    const data = JSON.parse( dataRaw )
    return JSON.stringify({ ...data, ...{ requestContext: { ...data.requestContext, role: role } } })
}

const authAdmin = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendSecretKeyToRequest, appendRoleToRequest('BACKEND_CODE') ) }

const authOwner = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendSecretKeyToRequest, appendRoleToRequest('OWNER' ) ) }

const authVisitor = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendSecretKeyToRequest, appendRoleToRequest('VISITOR' ) ) }

const authOwnerWithoutSecretKey = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendRoleToRequest('OWNER' ) ) }

const errorResponseWith = (status, message) => ({ response: { data: { message: expect.stringContaining(message) }, status } })


module.exports = { authInit, authAdmin, authOwner, authVisitor, authOwnerWithoutSecretKey, errorResponseWith }

