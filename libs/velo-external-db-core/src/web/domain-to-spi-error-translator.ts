import { errors as domainErrors } from '@wix-velo/velo-external-db-commons' 
import { ItemAlreadyExistsError, CollectionNotFoundError, ItemNotFoundError, CollectionAlreadyExistsError, CollectionChangeNotSupportedError, 
  UnknownError, FieldDoesNotExist, UnauthorizedError, FieldAlreadyExistsError, UnsupportedSchemaOperation } from '../spi-model/errors'

export const domainToSpiErrorTranslator = (err: any) => {
    switch(err.constructor) {
      case domainErrors.ItemAlreadyExists: 
        const itemAlreadyExists = err as domainErrors.ItemAlreadyExists
        return new ItemAlreadyExistsError(itemAlreadyExists.collectionName, itemAlreadyExists.itemId, itemAlreadyExists.message)
  
      case domainErrors.CollectionDoesNotExists:
        const collectionDoesNotExists = err as domainErrors.CollectionDoesNotExists
        return new CollectionNotFoundError(collectionDoesNotExists.collectionName, collectionDoesNotExists.message)
      
      case domainErrors.FieldAlreadyExists:
        const fieldAlreadyExists = err as domainErrors.FieldAlreadyExists
        return new FieldAlreadyExistsError(fieldAlreadyExists.collectionName, fieldAlreadyExists.fieldName, fieldAlreadyExists.message)
      
      case domainErrors.FieldDoesNotExist:
        const fieldDoesNotExist = err as domainErrors.FieldDoesNotExist
        return new FieldDoesNotExist(fieldDoesNotExist.collectionName, fieldDoesNotExist.propertyName, fieldDoesNotExist.message)
  
      case domainErrors.UnsupportedSchemaOperation:
        const unsupportedSchemaOperation = err as domainErrors.UnsupportedSchemaOperation
        return new UnsupportedSchemaOperation(unsupportedSchemaOperation.collectionName, unsupportedSchemaOperation.operation, unsupportedSchemaOperation.message)
      
      case domainErrors.CollectionAlreadyExists:
        const collectionAlreadyExists = err as domainErrors.CollectionAlreadyExists
        return new CollectionAlreadyExistsError(collectionAlreadyExists.collectionName, collectionAlreadyExists.message)
      
      case domainErrors.ItemDoesNotExists:
        const itemDoesNotExists = err as domainErrors.ItemDoesNotExists
        return new ItemNotFoundError(itemDoesNotExists.collectionName, itemDoesNotExists.itemId, itemDoesNotExists.message)

      case domainErrors.CollectionChangeNotSupportedError:
        const collectionChangeNotSupportedError = err as domainErrors.CollectionChangeNotSupportedError
        return new CollectionChangeNotSupportedError(collectionChangeNotSupportedError.collectionName, collectionChangeNotSupportedError.fieldName, collectionChangeNotSupportedError.message)

      case domainErrors.UnauthorizedError:
        const unauthorizedError = err as domainErrors.UnauthorizedError
        return new UnauthorizedError(unauthorizedError.message)
      
      default:
        return new UnknownError(err.message, err.status)
    }
  }

  export const domainToSpiErrorObjectTranslator = (err: any) => {
    const error = domainToSpiErrorTranslator(err)
    return { 
      error: {
        errorCode: error.errorCode,
        errorMessage: error.message,
        data: error.data,
      }
    }
  }
