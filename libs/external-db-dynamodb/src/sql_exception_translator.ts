import { errors } from '@wix-velo/velo-external-db-commons'
const { CollectionDoesNotExists, DbConnectionError } = errors

export const notThrowingTranslateErrorCodes = (err: any) => {
    switch (err.name) {
        case 'ResourceNotFoundException':
            return new CollectionDoesNotExists('Collection does not exists')
        case 'CredentialsProviderError':
            return new DbConnectionError('AWS_SECRET_ACCESS_KEY or AWS_ACCESS_KEY_ID are missing')
        case 'InvalidSignatureException':
            return new DbConnectionError('AWS_SECRET_ACCESS_KEY or AWS_ACCESS_KEY_ID are invalid')
    }

    switch (err.message) {
        case 'Region is missing':
            return new DbConnectionError('Region is missing')
        default:
            return new Error(`default ${err.message}`)
    }
}

export const translateErrorCodes = (err: any) => {
    throw notThrowingTranslateErrorCodes(err)
    
}
