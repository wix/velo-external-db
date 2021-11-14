const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, DbConnectionError } = require('velo-external-db-commons').errors

const notThrowingTranslateErrorCodes = err => {
    switch (err.message) {
        case 'ResourceNotFoundException':
            return new CollectionDoesNotExists('Collection does not exists')
        default :
            return new Error(`default ${err.message}`)
    }
}

const translateErrorCodes = err => {
    throw notThrowingTranslateErrorCodes(err);
}

module.exports = { translateErrorCodes, notThrowingTranslateErrorCodes }
