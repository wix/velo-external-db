import { errors } from '@wix-velo/velo-external-db-commons'
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, DbConnectionError, ItemAlreadyExists, UnrecognizedError, CollectionChangeNotSupportedError } = errors

const extractDuplicatedColumnName = (error: any) => extractValueFromErrorMessage(error.sqlMessage, /Duplicate column name '(.*)'/)
const extractDuplicatedItem = (error: any) => extractValueFromErrorMessage(error.sqlMessage, /Duplicate entry '(.*)' for key .*/) 
const extractUnknownColumn = (error: any) => extractValueFromErrorMessage(error.sqlMessage, /Unknown column '(.*)' in 'field list'/)
const extractColumnNameFromAltertionError = (error: any) => extractValueFromErrorMessage(error.sqlMessage, /column\s['`]([^'`]+)['`]/)

const extractValueFromErrorMessage = (msg: string, regex: RegExp) => {
    try {
        const match = msg.match(regex)
        const value = (match && match[1])
        return value || ''
    } catch(e) {
        return ''
    }
}

export const notThrowingTranslateErrorCodes = (err: any, collectionName: string) => {
    switch (err.code) {
        case 'ER_CANT_DROP_FIELD_OR_KEY':
            return new FieldDoesNotExist('Collection does not contain a field with this name', collectionName, extractUnknownColumn(err))
        case 'ER_DUP_FIELDNAME':
            return new FieldAlreadyExists('Collection already has a field with the same name', collectionName, extractDuplicatedColumnName(err))
        case 'ER_NO_SUCH_TABLE':
            return new CollectionDoesNotExists('Collection does not exists', collectionName)
        case 'ER_DBACCESS_DENIED_ERROR':
        case 'ER_BAD_DB_ERROR':
            return new DbConnectionError(`Database does not exists or you don't have access to it, sql message: ${err.sqlMessage}`)
        case 'ER_ACCESS_DENIED_ERROR':
            return new DbConnectionError(`Access to database denied - probably wrong credentials, sql message:  ${err.sqlMessage} `)
        case 'EAI_AGAIN':
        case 'ENOTFOUND':
            return new DbConnectionError(`Access to database denied - host is unavailable, sql message:  ${err.sqlMessage} `)
        case 'ER_DUP_ENTRY': 
            return new ItemAlreadyExists(`Item already exists: ${err.sqlMessage}`, collectionName, extractDuplicatedItem(err))
        case 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD':
        case 'WARN_DATA_TRUNCATED':
            return new CollectionChangeNotSupportedError(err.sqlMessage, collectionName, extractColumnNameFromAltertionError(err))
        default :
            console.error(err)
            return new UnrecognizedError(`${err.code} ${err.sqlMessage}`)
    }
}

export const translateErrorCodes = (err: any, collectionName: string) => {
    throw notThrowingTranslateErrorCodes(err, collectionName)
}
