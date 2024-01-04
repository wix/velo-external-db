import { errors } from '@wix-velo/velo-external-db-commons'
const { ItemAlreadyExists } = errors

const extractItemIdFromError = (err: any) => err.message.split('"')[1]

const notThrowingTranslateErrorCodes = (err: any, collectionName: string) => {
    switch (err.code) {
        case 11000:            
            return new ItemAlreadyExists(`Item already exists: ${err.message}`, collectionName, extractItemIdFromError(err))
        default: 
            return new Error (`default ${err.message}`) 
    }
}

export const translateErrorCodes = (err: any, collectionName: string) => {    
    throw notThrowingTranslateErrorCodes(err, collectionName)
}
