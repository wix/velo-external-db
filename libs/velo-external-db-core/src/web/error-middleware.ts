import { NextFunction, Response } from 'express'
import { domainToSpiErrorTranslator } from './domain-to-spi-error-translator'
import { ILogger } from '@wix-velo/external-db-logger'

export const errorMiddleware = (logger?: ILogger) => (err: any, _req: any, res: Response, _next?: NextFunction) => {
  if (process.env['NODE_ENV'] !== 'test') {
    logger?.error(err.message, err)
  }

  const error = domainToSpiErrorTranslator(err)
  res.status(error.httpCode).send({
    data: error.data,
    errorCode: error.errorCode,
  })
}
