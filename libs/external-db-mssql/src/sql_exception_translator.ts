import { errors } from '@wix-velo/velo-external-db-commons'
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, CollectionAlreadyExists, DbConnectionError, ItemAlreadyExists } = errors

export const notThrowingTranslateErrorCodes = (err: any) => {
    if (err.number) {
        switch (err.number) {
            case 4902:
                return new CollectionDoesNotExists('Collection does not exists')
            case 2705:
                return new FieldAlreadyExists('Collection already has a field with the same name')
            case 2627: 
                return new ItemAlreadyExists(`Item already exists: ${err.message}`)
            case 4924:
                return new FieldDoesNotExist('Collection does not contain a field with this name')
            case 2714:
                return new CollectionAlreadyExists('Collection already exists')
            default:
                return new Error(`default ${err.message}`)
        }
    }
    else {
        switch (err.code) {
            case 'ELOGIN':
                return new DbConnectionError(`Access to database denied - probably wrong credentials, sql message: ${err.message}`) 
            case 'ESOCKET':
                return new DbConnectionError(`Access to database denied - host is unavailable, sql message: ${err.message}`)
            default:
                return new Error(`default ${err.sqlMessage}`)
        }
    }
}

export const translateErrorCodes = (err: any) => {
    throw notThrowingTranslateErrorCodes(err)
}
