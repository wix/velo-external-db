const { CollectionDoesNotExists, CollectionAlreadyExists, FieldAlreadyExists } = require('velo-external-db-commons').errors

const notThrowingTranslateErrorCodes = err => {
    switch (err.code) {
        case '404':
            return new CollectionDoesNotExists(err.message)
        case '400':
            return new FieldAlreadyExists(err.message)
        case '409':
            return new CollectionAlreadyExists(err.message)

        default :
            return new Error(`default ${err.code}, ${err.message}`)
    }
}

const translateErrorCodes = err => {
    console.log(err)
    throw notThrowingTranslateErrorCodes(err)
}

module.exports = { notThrowingTranslateErrorCodes, translateErrorCodes }

