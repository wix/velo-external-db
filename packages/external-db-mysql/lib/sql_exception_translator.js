const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist,AccessDeniedError,wrongDatabaseError,
        HostDoesNotExists } = require('velo-external-db-commons').errors

const translateErrorCodes = err => {
    switch (err.code) {
        case 'ER_CANT_DROP_FIELD_OR_KEY':
            throw new FieldDoesNotExist('Collection does not contain a field with this name')
        case 'ER_DUP_FIELDNAME':
            throw new FieldAlreadyExists('Collection already has a field with the same name')
        case 'ER_NO_SUCH_TABLE':
            throw new CollectionDoesNotExists('Collection does not exists')
        case 'ER_DBACCESS_DENIED_ERROR':
        case 'ER_BAD_DB_ERROR':
            throw new wrongDatabaseError(`Database does not exists or you don\'t have access to it, sql message: ${err.sqlMessage}`)
        case 'ER_ACCESS_DENIED_ERROR':
            throw new AccessDeniedError(`Access to database denied - probably wrong credentials,sql message:  ${err.sqlMessage} `)
        case 'ENOTFOUND':
            throw new HostDoesNotExists('Database host does not found.')
        default :
            throw new Error(`default ${err.sqlMessage}`)
    }
}

module.exports = translateErrorCodes
