const { CollectionDoesNotExists, FieldAlreadyExists } = require('velo-external-db-commons').errors

const notThrowingTranslateErrorCodes = err => {
    switch (err.code) {
        case '404':
            return new CollectionDoesNotExists(err.message)
        default :
            return new Error(`default ${err.code}, ${err.message}`)
    }
}

const translateErrorCodes = err => {
    throw notThrowingTranslateErrorCodes(err)
}

const createCollectionTranslateErrorCodes = err => {
    if (err.code === 409)
        // we don't want to throw an error if the collection already exists
        return 
    else
        throw notThrowingTranslateErrorCodes(err)
}

const addColumnTranslateErrorCodes = err => {
    if (err.message.includes('Not found: Table'))
        throw new CollectionDoesNotExists(err.message)
    else if (err.code === 400)
        throw new FieldAlreadyExists(err.message)
    else
        throw notThrowingTranslateErrorCodes(err)
}

module.exports = { notThrowingTranslateErrorCodes, translateErrorCodes,
    createCollectionTranslateErrorCodes, addColumnTranslateErrorCodes }

