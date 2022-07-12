import { errors } from '@wix-velo/velo-external-db-commons'
const { DbConnectionError } = errors

export const notThrowingTranslateErrorCodes = (err: any) => {
    switch (err.error) {
        case 'NOT_FOUND':
            return new DbConnectionError(`Base does not exists: Airtable message : ${err.message}`)
        case 'AUTHENTICATION_REQUIRED':
            return new DbConnectionError(`Authentication failed: Airtable message: ${err.message}`)
        default:
            return new DbConnectionError(err.message)
    }
}
