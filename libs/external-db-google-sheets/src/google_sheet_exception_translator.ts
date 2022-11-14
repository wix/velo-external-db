import { errors } from '@wix-velo/velo-external-db-commons'
const { FieldAlreadyExists, UnrecognizedError, DbConnectionError } = errors

export const notThrowingTranslateErrorCodes = (err: any) => {
    
    if (!err.code) {
        if (err.message.includes('entity was not found'))
            return new DbConnectionError('Sheet ID is invalid')
    }

    switch (err.code) {
        case 'ERR_OSSL_PEM_BAD_BASE64_DECODE':
        case 'ERR_OSSL_PEM_NO_START_LINE':
        case 'ERR_OSSL_PEM_BAD_END_LINE':
        case 'ERR_OSSL_UNSUPPORTED':
            return new DbConnectionError(`API key is invalid: ${err.message}`)
        case '400':
            return new DbConnectionError('Client email is invalid')
        default : 
            return new UnrecognizedError(`${err.message}`)
    }
}

export const translateErrorCodes = (err: any) => {

    if (err.message.includes('Duplicate header detected')) {
        return new FieldAlreadyExists(err)
    }

    return new UnrecognizedError(`${err.errors[0].message}`)
}


