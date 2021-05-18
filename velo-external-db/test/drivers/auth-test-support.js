const chance = new require('chance')();
const axios = require('axios').create({
    baseURL: 'http://localhost:8080',
});

const secretKey = chance.word()

const authInit = () => {
    process.env.SECRET_KEY = secretKey
}

const appendSecretKeyToRequest = dataRaw => {
    const data = JSON.parse( dataRaw )
    const newData = Object.assign({}, data, {requestContext: {settings: {secretKey: secretKey}}})
    return JSON.stringify(newData)
}

const auth = { transformRequest: axios.defaults
                                      .transformRequest
                                      .concat( appendSecretKeyToRequest ) }


module.exports = { authInit, auth }

