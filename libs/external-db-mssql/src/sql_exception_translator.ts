import { errors } from '@wix-velo/velo-external-db-commons'
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, CollectionAlreadyExists, 
    DbConnectionError, ItemAlreadyExists, CollectionChangeNotSupportedError } = errors

export const notThrowingTranslateErrorCodes = (err: any, collectionName?: string, fieldName?: string) => {
    if (err.number) {
        switch (err.number) {
            case 4902:
                return new CollectionDoesNotExists('Collection does not exists', collectionName)
            case 2705:
                return new FieldAlreadyExists('Collection already has a field with the same name', collectionName, extractColumnName(err.message))
            case 2627: 
                return new ItemAlreadyExists(`Item already exists: ${err.message}`, collectionName, extractDuplicateKey(err.message))
            case 4924:
                return new FieldDoesNotExist('Collection does not contain a field with this name', collectionName)
            case 2714:
                return new CollectionAlreadyExists('Collection already exists', collectionName)
            case 8114:
                return new CollectionChangeNotSupportedError(`${err.message}`, collectionName, fieldName)
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

export const translateErrorCodes = (err: any, collectionName?: string, fieldName?: string) => {
    throw notThrowingTranslateErrorCodes(err, collectionName, fieldName)
}



const extractDuplicateKey = (errorMessage: string) => {
    const regex = /The duplicate key value is \((.*)\)/i
    const match = errorMessage.match(regex)
    if (match) {
      return match[1]
    }
    return ''
  }

const extractColumnName = (errorMessage: string) => {
    const regex = /Column name '(\w+)'/i
    const match = errorMessage.match(regex)
    if (match) {
      return match[1]
    }
    return ''
  }
  
