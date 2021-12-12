const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, DbConnectionError, CollectionAlreadyExists } = require('velo-external-db-commons').errors

const notThrowingTranslateErrorCodes = err => {
    switch (err.code) {
        case 9:
            if (err.details.includes('column')) {
                return new FieldAlreadyExists(err.details)
            } else {
                return new CollectionAlreadyExists(err.details)
            }
        case 5:
            if (err.details.includes('Column')) {
                return new FieldDoesNotExist(err.details)
            } else if (err.details.includes('Instance')) {
                return new DbConnectionError(`Access to database denied - wrong credentials or host is unavailable, sql message:  ${err.details} `)
            } else if (err.details.includes('Database')) {
                return new DbConnectionError(`Database does not exists or you don't have access to it, sql message: ${err.details}`)
            } else if (err.details.includes('Table')) {
                return new CollectionDoesNotExists(err.details)
            } else {
                return new Error(`default ${err.details}`)
            }

        case 7:
            return new DbConnectionError(`Access to database denied - host is unavailable or wrong credentials, sql message:  ${err.details} `)

        default :
            console.log(err)
            return new Error(`default ${err.details}`)
    }
}

const translateErrorCodes = err => {
    throw notThrowingTranslateErrorCodes(err)
}

module.exports = { translateErrorCodes, notThrowingTranslateErrorCodes }
