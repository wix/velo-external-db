import { errors } from '@wix-velo/velo-external-db-commons'
const { FieldAlreadyExists, UnrecognizedError } = errors

export const notThrowingTranslateErrorCodes = (err: any) => {
    switch (err.code) {
        default :
            return new UnrecognizedError(`${err}`)
    }
}
export const translateErrorCodes = (err: any) => {

    if (err.message.includes('Duplicate header detected')) {
        return new FieldAlreadyExists(err)
    }

    return new UnrecognizedError(`${err.errors[0].message}`)
}


