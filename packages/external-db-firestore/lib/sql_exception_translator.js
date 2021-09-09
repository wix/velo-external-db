/* eslint-disable */
const { DbConnectionError } = require('velo-external-db-commons').errors


const notThrowingTranslateErrorCodes = err => {
    switch (err.code) {
        case 7:
            return new DbConnectionError(`Access to database denied - probably wrong credentials,sql message:  ${err.details} `)
        // case 9:
        //     if (err.details.includes('column')) {
        //         return new FieldAlreadyExists(err.details/*'Collection already has a field with the same name'*/)
        //     } else {
        //         return new CollectionAlreadyExists(err.details)
        //     }
        // case 5:
        //     if (err.details.includes('Column')) {
        //         return new FieldDoesNotExist(err.details)
        //     } else if (err.details.includes('Instance')) {
        //         return new AccessDeniedError(`Access to database denied - probably wrong credentials,sql message:  ${err.details} `)
        //     } else if (err.details.includes('Database')) {
        //         return new WrongDatabaseError(`Database does not exists or you don\'t have access to it, sql message: ${err.details}`)
        //     } else if (err.details.includes('Table')) {
        //         return new CollectionDoesNotExists(err.details)
        //     } else {
        //         console.log(err)
        //         return new Error(`default ${err.details}`)
        //     }

        //     return new WrongDatabaseError(`Database does not exists or you don\'t have access to it, sql message: ${err.sqlMessage}`)
        //     return new AccessDeniedError(`Access to database denied - probably wrong credentials,sql message:  ${err.sqlMessage} `)
        //     return new HostDoesNotExists('Database host does not found.')
        default :
            console.log(err)
            return new Error(`default ${err.details}`)
    }
}

const translateErrorCodes = err => {
    throw notThrowingTranslateErrorCodes(err);
}

module.exports = { translateErrorCodes, notThrowingTranslateErrorCodes }
