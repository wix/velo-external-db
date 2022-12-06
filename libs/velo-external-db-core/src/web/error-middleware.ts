import { NextFunction, Response } from 'express'
import { errors as domainErrors} from '@wix-velo/velo-external-db-commons' 
import { ErrorMessage } from '../spi-model/errors'

interface requestMetadata {
  collectionId: string
}

export const domainToSpiErrorsTranslator = (err: any) => {
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
      return ErrorMessage.invalidProperty(fieldDoesNotExist.collectionName, fieldDoesNotExist.itemId)

    default:
      return ErrorMessage.unknownError(err.message)  
  }
}

export const errorMiddleware = (err: any, _req: any, res: Response, _next?: NextFunction) => {
  if (process.env['NODE_ENV'] !== 'test') {
    console.error(err)
  }

  const errorMsg = domainToSpiErrorsTranslator(err)
  res.status(errorMsg.httpCode).send(errorMsg.message)
}
