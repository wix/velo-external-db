import { errors } from '@wix-velo/velo-external-db-commons'
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, DbConnectionError, ItemAlreadyExists, UnrecognizedError } = errors

export const notThrowingTranslateErrorCodes = (err: any) => {
    switch (err.code) {
        case '42703':
            return new FieldDoesNotExist('Collection does not contain a field with this name')
        case '42701':
            return new FieldAlreadyExists('Collection already has a field with the same name')
        case '23505':
            return new ItemAlreadyExists(`Item already exists: ${err.message}`)
        case '42P01':
            return new CollectionDoesNotExists('Collection does not exists')
        case '28P01':
            return new DbConnectionError(`Access to database denied - probably wrong credentials,sql message:  ${err.message}`)
        case '3D000':
            return new DbConnectionError(`Database does not exists or you don't have access to it, sql message: ${err.message}`)
        case 'ENOTFOUND':
        case 'EAI_AGAIN':
            return new DbConnectionError('Database host is unavailable.')
        default :
            return new UnrecognizedError(`${err.code}, ${err.message}`)
    }
}

export const translateErrorCodes = (err: any) => {
    throw notThrowingTranslateErrorCodes(err)
}

