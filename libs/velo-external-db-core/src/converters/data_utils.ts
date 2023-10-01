import { isDate, errors as domainErrors } from '@wix-velo/velo-external-db-commons'
import { Item, ItemWithId } from '@wix-velo/velo-external-db-types'
import * as crypto from 'crypto'
import { ApiErrors } from '../spi-model/errors'
import { ApplicationError } from '../spi-model/data_source'

export const asWixData = (item: Item) => { 
    return generateIdsIfNeeded(packDates(item))
}

export const generateIdsIfNeeded = (item: Item): ItemWithId => {
    if ('_id' in item)
        return item as ItemWithId
    const sha = crypto.createHash('sha1')
    const fieldsConcat = Object.values(item).join('')
    return { ...item, _id: sha.update(fieldsConcat).digest('base64') }
}

const packDates = (item: Item) => Object.entries(item)
                                .reduce((o, [k, v]) => ({ ...o, [k]: isDate(v) ? { $date: new Date(v).toISOString() } : v }), {})


export const domainToSpiErrorTranslator = (err: any): ApplicationError => {
    switch(err.constructor) {
        case domainErrors.ItemAlreadyExists: 
        const itemAlreadyExists: domainErrors.ItemAlreadyExists = err
        return { code: ApiErrors.WDE0074, description: itemAlreadyExists.message }
        
        case domainErrors.CollectionDoesNotExists:
        const collectionDoesNotExists: domainErrors.CollectionDoesNotExists = err
        return { code: ApiErrors.WDE0025, description: collectionDoesNotExists.message }
        
        case domainErrors.FieldAlreadyExists:
        const fieldAlreadyExists: domainErrors.FieldAlreadyExists = err
        return { code: ApiErrors.WDE0074, description: fieldAlreadyExists.message }
        
        case domainErrors.FieldDoesNotExist:
        const fieldDoesNotExist: domainErrors.FieldDoesNotExist = err
        return { code: ApiErrors.WDE0147, description: fieldDoesNotExist.message }
    
        case domainErrors.UnsupportedSchemaOperation:
        const unsupportedSchemaOperation: domainErrors.UnsupportedSchemaOperation = err
        return { code: ApiErrors.WDE0025, description: unsupportedSchemaOperation.message }
        
        default:
        return { code: ApiErrors.WDE0112, description: err.message }
    }
}
                                
