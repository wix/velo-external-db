import { errors as domainErrors } from '@wix-velo/velo-external-db-commons' 
import { ErrorMessage } from '../spi-model/errors'

export const domainToSpiErrorTranslator = (err: any) => {
    switch(err.constructor) {
      case domainErrors.ItemAlreadyExists: 
        const itemAlreadyExists: domainErrors.ItemAlreadyExists = err
        return ErrorMessage.itemAlreadyExists(itemAlreadyExists.itemId, itemAlreadyExists.collectionName, itemAlreadyExists.message)
  
      case domainErrors.CollectionDoesNotExists:
        const collectionDoesNotExists: domainErrors.CollectionDoesNotExists = err
        return ErrorMessage.collectionNotFound(collectionDoesNotExists.collectionName, collectionDoesNotExists.message)
      
      case domainErrors.FieldAlreadyExists:
        const fieldAlreadyExists: domainErrors.FieldAlreadyExists = err
        return ErrorMessage.itemAlreadyExists(fieldAlreadyExists.fieldName, fieldAlreadyExists.collectionName, fieldAlreadyExists.message)
      
      case domainErrors.FieldDoesNotExist:
        const fieldDoesNotExist: domainErrors.FieldDoesNotExist = err
        return ErrorMessage.invalidProperty(fieldDoesNotExist.collectionName, fieldDoesNotExist.propertyName, fieldDoesNotExist.message)
  
      case domainErrors.UnsupportedSchemaOperation:
        const unsupportedSchemaOperation: domainErrors.UnsupportedSchemaOperation = err
        return ErrorMessage.operationIsNotSupportedByCollection(unsupportedSchemaOperation.collectionName, unsupportedSchemaOperation.operation, unsupportedSchemaOperation.message)
      
      case domainErrors.ItemDoesNotExists:
        const itemDoesNotExists: domainErrors.ItemDoesNotExists = err
        return ErrorMessage.itemNotFound(itemDoesNotExists.itemId, itemDoesNotExists.collectionName, itemDoesNotExists.message)
    
      case domainErrors.UnauthorizedError:
        const unauthorizedError: domainErrors.UnauthorizedError = err
        return ErrorMessage.unauthorized(unauthorizedError.message)
        
      default:
        return ErrorMessage.unknownError(err.message, err.status)  
    }
  }

  export const domainToSpiErrorObjectTranslator = (err: any) => {
    const { message, httpCode } = domainToSpiErrorTranslator(err)
    return { 
      error: {
        errorCode: httpCode,
        errorMessage: message.description,
        data: message.data
      }
    }
  }
