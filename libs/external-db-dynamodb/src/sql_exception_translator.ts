import { errors } from '@wix-velo/velo-external-db-commons'
import { Item } from '@wix-velo/velo-external-db-types'
const { CollectionDoesNotExists, DbConnectionError, ItemAlreadyExists } = errors

export const notThrowingTranslateErrorCodes = (err: any, collectionName?: string, metaData?: { items?: Item[] }) => {
    switch (err.name) {
        case 'ResourceNotFoundException':
            return new CollectionDoesNotExists('Collection does not exists', collectionName)
        case 'CredentialsProviderError':
            return new DbConnectionError('AWS_SECRET_ACCESS_KEY or AWS_ACCESS_KEY_ID are missing')
        case 'InvalidSignatureException':
            return new DbConnectionError('AWS_SECRET_ACCESS_KEY or AWS_ACCESS_KEY_ID are invalid')
        case 'TransactionCanceledException':
            if (err.message.includes('ConditionalCheckFailed')) {
                const itemId = metaData?.items?.[err.CancellationReasons.findIndex((reason: any) => reason.Code === 'ConditionalCheckFailed')]._id
                return new ItemAlreadyExists('Item already exists', collectionName, itemId)
            }
    }

    switch (err.message) {
        case 'Region is missing':
            return new DbConnectionError('Region is missing')
        case 'Cannot read properties of undefined (reading \'sso_session\')':
            return new DbConnectionError('AWS_SECRET_ACCESS_KEY or AWS_ACCESS_KEY_ID are missing')
        default:
            return new Error(`default ${err.message}`)
    }
}

export const translateErrorCodes = (err: any, collectionName?: string, metaData?: {items?: Item[]}) => {
    throw notThrowingTranslateErrorCodes(err, collectionName, metaData)
    
}


export const translateUpdateErrors = (err:any) => {
    const affectedRows = err.CancellationReasons.reduce((acc:any, reson: any) => {
        switch (reson.Code) {
            case 'None':
                return acc + 1
            case 'ConditionalCheckFailed':
                return acc
            default:
                return acc
        }
    }, 0)

    return { affectedRows }
}
