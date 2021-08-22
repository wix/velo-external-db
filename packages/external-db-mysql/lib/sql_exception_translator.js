const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, AccessDeniedError, WrongDatabaseError,
    HostDoesNotExists } = require('velo-external-db-commons').errors

const notThrowingTranslateErrorCodes = err => {
    switch (err.code) {
        case 'ER_CANT_DROP_FIELD_OR_KEY':
            return new FieldDoesNotExist('Collection does not contain a field with this name')
        case 'ER_DUP_FIELDNAME':
            return new FieldAlreadyExists('Collection already has a field with the same name')
        case 'ER_NO_SUCH_TABLE':
            return new CollectionDoesNotExists('Collection does not exists')
        case 'ER_DBACCESS_DENIED_ERROR':
        case 'ER_BAD_DB_ERROR':
            return new WrongDatabaseError(`Database does not exists or you don\'t have access to it, sql message: ${err.sqlMessage}`)
        case 'ER_ACCESS_DENIED_ERROR':
            return new AccessDeniedError(`Access to database denied - probably wrong credentials,sql message:  ${err.sqlMessage} `)
        case 'ENOTFOUND':
            return new HostDoesNotExists('Database host does not found.')
        default :
            return new Error(`default ${err.sqlMessage}`)
    }
}

const translateErrorCodes = err => {
    throw notThrowingTranslateErrorCodes(err);
}

module.exports = { translateErrorCodes, notThrowingTranslateErrorCodes }
