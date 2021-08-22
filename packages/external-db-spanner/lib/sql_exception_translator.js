const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, AccessDeniedError, WrongDatabaseError,
    HostDoesNotExists, CollectionAlreadyExists } = require('velo-external-db-commons').errors

const notThrowingTranslateErrorCodes = err => {
    switch (err.code) {
        case 9:
            if (err.details.includes('column')) {
                return new FieldAlreadyExists(err.details/*'Collection already has a field with the same name'*/)
            } else {
                return new CollectionAlreadyExists(err.details)
            }
        case 5:
            if (err.details.includes('Column')) {
                return new FieldDoesNotExist(err.details/*'Collection does not contain a field with this name'*/)
            } else {
                return new CollectionDoesNotExists(err.details/*'Collection does not exists'*/)
            }
            // console.log(err)
        // case 'ER_CANT_DROP_FIELD_OR_KEY':
        // case 'ER_DUP_FIELDNAME':
        //     return new FieldAlreadyExists('Collection already has a field with the same name')
        // case 'ER_NO_SUCH_TABLE':
        // case 'ER_DBACCESS_DENIED_ERROR':
        // case 'ER_BAD_DB_ERROR':
        //     return new WrongDatabaseError(`Database does not exists or you don\'t have access to it, sql message: ${err.sqlMessage}`)
        // case 'ER_ACCESS_DENIED_ERROR':
        //     return new AccessDeniedError(`Access to database denied - probably wrong credentials,sql message:  ${err.sqlMessage} `)
        // case 'ENOTFOUND':
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
