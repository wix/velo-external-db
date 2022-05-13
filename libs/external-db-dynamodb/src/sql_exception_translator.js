const { CollectionDoesNotExists, DbConnectionError } = require('velo-external-db-commons').errors

const notThrowingTranslateErrorCodes = err => {
    switch (err.name) {
        case 'ResourceNotFoundException':
            return new CollectionDoesNotExists('Collection does not exists')
        case 'CredentialsProviderError':
            return new DbConnectionError('AWS_SECRET_ACCESS_KEY or AWS_ACCESS_KEY_ID are missing')
        case 'InvalidSignatureException':
            return new DbConnectionError('AWS_SECRET_ACCESS_KEY or AWS_ACCESS_KEY_ID are invalid')
    }

    switch (err.message) {
        case 'Region is missing':
            return new DbConnectionError('Region is missing')
        default:
            return new Error(`default ${err.message}`)
    }
}

const translateErrorCodes = err => {
    throw notThrowingTranslateErrorCodes(err)
    
}

module.exports = { translateErrorCodes, notThrowingTranslateErrorCodes }
