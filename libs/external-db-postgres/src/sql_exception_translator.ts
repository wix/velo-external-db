import { errors } from '@wix-velo/velo-external-db-commons'
import { IBaseHttpError } from '@wix-velo/velo-external-db-types'
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, DbConnectionError, ItemAlreadyExists, UnrecognizedError, CollectionChangeNotSupportedError } = errors

const extractDuplicatedItem = (error: any) => extractValueFromErrorMessage(error.detail, /Key \(_id\)=\((.*)\) already exists\./)

const extractValueFromErrorMessage = (msg: string, regex: RegExp) => {
    try {
        const match = msg.match(regex)
        const value = (match && match[1])
        return value || ''
    } catch(e) {
        return ''
    }
}

export const notThrowingTranslateErrorCodes = (err: any, collectionName: string, fieldName?: string): IBaseHttpError => {
    switch (err.code) {
        case '42703':
            return new FieldDoesNotExist('Collection does not contain a field with this name')
        case '42701':
            return new FieldAlreadyExists('Collection already has a field with the same name')
        case '23505':
            return new ItemAlreadyExists(`Item already exists: ${err.message}`, err.table, extractDuplicatedItem(err))
        case '42P01':
            return new CollectionDoesNotExists('Collection does not exists', err.table)
        case '28P01':
            return new DbConnectionError(`Access to database denied - probably wrong credentials,sql message:  ${err.message}`)
        case '3D000':
            return new DbConnectionError(`Database does not exists or you don't have access to it, sql message: ${err.message}`)
        case 'ENOTFOUND':
        case 'EAI_AGAIN':
            return new DbConnectionError('Database host is unavailable.')
        case '22P02':
            return new CollectionChangeNotSupportedError(`${err.message}`, collectionName, fieldName)
        default :
            console.error(err)
            return new UnrecognizedError(`${err.code}, ${err.message}`)
    }
}

export const translateErrorCodes = (err: any, collectionName: string, fieldName?: string) => {
    throw notThrowingTranslateErrorCodes(err, collectionName, fieldName)
}

