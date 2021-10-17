

const { DbConnectionError } = require('velo-external-db-commons').errors

const notThrowingTranslateErrorCodes = err => {
    switch (err.error) {
        case 'NOT_FOUND':
            return new DbConnectionError(`Base does not exists: Airtable message : ${err.message}`)
        case 'AUTHENTICATION_REQUIRED':
            return new DbConnectionError(`Authentication failed: Airtable message: ${err.message}`)
        default:
            return new DbConnectionError(err.message)
    }
}

module.exports = { notThrowingTranslateErrorCodes }
