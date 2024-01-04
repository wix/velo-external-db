import { errors } from '@wix-velo/velo-external-db-commons'
const { DbConnectionError, UnrecognizedError, ItemAlreadyExists, ItemDoesNotExists } = errors

const extractValue = (details: string, valueName: string) => extractValueFromErrorMessage(details, new RegExp(`${valueName}:\\s*"([^"]+)"`))

const extractValueFromErrorMessage = (msg: string, regex: RegExp) => {
    try {
        const match = msg.match(regex)
        const value = (match && match[1])
        return value || ''
    } catch(e) {
        return ''
    }
}

export const notThrowingTranslateErrorCodes = (err: any) => {
    const collectionName = extractValue(err.details, 'type')
    const itemId = extractValue(err.details, 'name')

    switch (err.code) {
        case 5:
            return new ItemDoesNotExists(`Item doesn't exists: ${err.details}`, collectionName, itemId)
        case 6:
            return new ItemAlreadyExists(`Item already exists: ${err.details}`, collectionName, itemId)
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
