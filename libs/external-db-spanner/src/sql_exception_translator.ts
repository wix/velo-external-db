import { errors } from '@wix-velo/velo-external-db-commons'
const { CollectionDoesNotExists, FieldAlreadyExists, FieldDoesNotExist, DbConnectionError, CollectionAlreadyExists, ItemAlreadyExists, InvalidQuery, UnrecognizedError, ItemDoesNotExists } = errors
const extractId = (msg: string | null) => {
    msg = msg || ''
    const regex = /String\("([A-Za-z0-9-]+)"\)/i
    const match = msg.match(regex)
    if (match) {
      return match[1]
    }
    return ''
  }

export const notThrowingTranslateErrorCodes = (err: any, collectionName?: string) => {
    switch (err.code) {
        case 9:
            if (err.details.includes('column')) {
                return new FieldAlreadyExists(err.details)
            } else {
                return new CollectionAlreadyExists(err.details)
            }
        case 5:
            if (err.details.includes('Column')) {
                return new FieldDoesNotExist(err.details, collectionName)
            } else if (err.details.includes('Instance')) {
                return new DbConnectionError(`Access to database denied - wrong credentials or host is unavailable, sql message:  ${err.details} `)
            } else if (err.details.includes('Database')) {
                return new DbConnectionError(`Database does not exists or you don't have access to it, sql message: ${err.details}`)
            } else if (err.details.includes('Row') && err.details.includes('not found')) {
                return new ItemDoesNotExists(`Item doesn't exists: ${err.details}`, collectionName, extractId(err.details))
            } else if (err.details.includes('Table')) {
                console.log({ details: err.details, collectionName })
                
                return new CollectionDoesNotExists(err.details, collectionName)
            } else {
                return new InvalidQuery(`${err.details}`)
            }
        case 6:
            if (err.details.includes('already exists')) 
                return new ItemAlreadyExists(`Item already exists: ${err.details}`, collectionName, extractId(err.details))

            else
                return new InvalidQuery(`${err.details}`)
        case 7:
            return new DbConnectionError(`Access to database denied - host is unavailable or wrong credentials, sql message:  ${err.details} `)

        default :
            console.error(err)
            return new UnrecognizedError(`${err.details}`)
    }
}

export const translateErrorCodes = (err: any, collectionName?: string) => {
    throw notThrowingTranslateErrorCodes(err, collectionName)
}
