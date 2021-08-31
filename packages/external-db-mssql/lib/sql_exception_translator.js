const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, CollectionAlreadyExists } = require('velo-external-db-commons').errors

const notThrowingTranslateErrorCodes = err => {
    switch (err.number) {
        case 4902:
            return new CollectionDoesNotExists('Collection does not exists')
        case 2705:
            return new FieldAlreadyExists('Collection already has a field with the same name')
        case 4924:
            return new FieldDoesNotExist('Collection does not contain a field with this name')
        case 2714:
            return new CollectionAlreadyExists('Collection already exists')
        //     return new WrongDatabaseError(`Database does not exists or you don\'t have access to it, sql message: ${err.sqlMessage}`)
        //     return new AccessDeniedError(`Access to database denied - probably wrong credentials,sql message:  ${err.sqlMessage} `)
        //     return new AccessDeniedError('Database host does not found.')
        default :
            console.log(err.number)
            console.log(err)
            return new Error(`default ${err.sqlMessage}`)
    }
}

const translateErrorCodes = err => {
    throw notThrowingTranslateErrorCodes(err);
}

module.exports = { translateErrorCodes, notThrowingTranslateErrorCodes }
