import { errors } from '@wix-velo/velo-external-db-commons'
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, DbConnectionError, ItemAlreadyExists } = errors

export const notThrowingTranslateErrorCodes = (err: any) => {
    switch (err.code) {
        case 'ER_CANT_DROP_FIELD_OR_KEY':
            return new FieldDoesNotExist('Collection does not contain a field with this name')
        case 'ER_DUP_FIELDNAME':
            return new FieldAlreadyExists('Collection already has a field with the same name')
        case 'ER_NO_SUCH_TABLE':
            return new CollectionDoesNotExists('Collection does not exists')
        case 'ER_DBACCESS_DENIED_ERROR':
        case 'ER_BAD_DB_ERROR':
            return new DbConnectionError(`Database does not exists or you don't have access to it, sql message: ${err.sqlMessage}`)
        case 'ER_ACCESS_DENIED_ERROR':
            return new DbConnectionError(`Access to database denied - probably wrong credentials, sql message:  ${err.sqlMessage} `)
        case 'EAI_AGAIN':
        case 'ENOTFOUND':
            return new DbConnectionError(`Access to database denied - host is unavailable, sql message:  ${err.sqlMessage} `)
        case 'ER_DUP_ENTRY': 
            return new ItemAlreadyExists(`Item already exists: ${err.sqlMessage}`)
        default :
            return new Error(`default ${err.code} ${err.sqlMessage}`)
    }
}

export const translateErrorCodes = (err: any) => {
    throw notThrowingTranslateErrorCodes(err)
}
