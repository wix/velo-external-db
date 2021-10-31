const axios = require('axios')

const appendSecretKeyRoleToRequest = (data, secretKey) => ({
    ...data,
    requestContext: {
        role: 'OWNER',
        settings: { secretKey }
    }
})

const axiosFor = ({ adaptorUrl, adaptorSecretKey }) => {
    return axios.create({
        baseURL: adaptorUrl,
        transformRequest: [
            (data, headers) => appendSecretKeyRoleToRequest(data, adaptorSecretKey),
            ...axios.defaults.transformRequest]
    })
}

module.exports = { axiosFor }