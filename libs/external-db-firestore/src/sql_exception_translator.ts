import { errors } from '@wix-velo/velo-external-db-commons'
const { DbConnectionError, UnrecognizedError } = errors


export const notThrowingTranslateErrorCodes = (err: any) => {
    switch (err.code) {
        case 7:
            return new DbConnectionError(`Permission denied - Cloud Firestore API has not been enabled: ${err.details}`)
        case 16:
            return new DbConnectionError(`Access to database denied - probably wrong credentials,firestore message: ${err.details}`)
        default :
            console.error(err)
            return new UnrecognizedError(err.details)
    }
}

export const translateErrorCodes = (err: any) => {
    throw notThrowingTranslateErrorCodes(err)
}
