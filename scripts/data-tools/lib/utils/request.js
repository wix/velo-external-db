const axios = require('axios')

const appendSecretKeyRoleToRequest = (data, secretKey) => ({
    ...data,
    requestContext: {
        role: 'OWNER',
        settings: { secretKey }
    }
})

const axiosFor = ({ adapterUrl, secretKey }) => {
    return axios.create({
        baseURL: adapterUrl,
        transformRequest: [
            (data, headers) => appendSecretKeyRoleToRequest(data, secretKey),
            ...axios.defaults.transformRequest]
    })
}

module.exports = { axiosFor }