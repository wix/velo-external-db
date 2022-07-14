import { errors } from '@wix-velo/velo-external-db-commons'
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist } = errors

export const notThrowingTranslateErrorCodes = (err: any) => {
    switch (err.code) {
        case '404':
            return new CollectionDoesNotExists(err.message)
        default :
            return new Error(`default ${err.code}, ${err.message}`)
    }
}

export const translateErrorCodes = (err: any) => {
    throw notThrowingTranslateErrorCodes(err)
}

export const createCollectionTranslateErrorCodes = (err: any) => {
    if (err.code === 409)
        // we don't want to throw an error if the collection already exists
        return 
    else
        throw notThrowingTranslateErrorCodes(err)
}

export const addColumnTranslateErrorCodes = (err: any) => {
    if (err.message.includes('Not found: Table'))
        throw new CollectionDoesNotExists(err.message)
    else if (err.code === 400)
        throw new FieldAlreadyExists(err.message)
    else
        throw notThrowingTranslateErrorCodes(err)
}

export const removeColumnTranslateErrorCodes = (err: any) => {
    if (err.code === 400)
        throw new FieldDoesNotExist(err.message)
    else
        throw notThrowingTranslateErrorCodes(err)
}


