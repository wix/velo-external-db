const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist,AccessDeniedError,HostDoesNotExists,wrongDatabaseError } = require('velo-external-db-commons').errors

const translateErrorCodes = err => {
    switch (err.code) {
        case '42703':
            throw new FieldDoesNotExist('Collection does not contain a field with this name')
        case '42701':
            throw new FieldAlreadyExists('Collection already has a field with the same name')
        case '42P01':
            throw new CollectionDoesNotExists('Collection does not exists')
        case '28P01':
            throw new AccessDeniedError(`Access to database denied - probably wrong credentials,sql message:  ${err.sqlMessage}`)
        case '3D000':
            throw new wrongDatabaseError(`Database does not exists or you don\'t have access to it, sql message: ${err.sqlMessage}`)
        case 'ENOTFOUND':
            throw new HostDoesNotExists('Database host does not found.')
        default :
            console.log(err)
            throw new Error(`default ${err.code}`)
    }
}

module.exports = translateErrorCodes
