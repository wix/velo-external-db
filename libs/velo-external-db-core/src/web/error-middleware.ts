import { NextFunction, Response } from 'express'
import { domainToSpiErrorTranslator } from './domain-to-spi-error-translator'

export const errorMiddleware = (err: any, _req: any, res: Response, _next?: NextFunction) => {
  if (process.env['NODE_ENV'] !== 'test') {
    console.error(err)
  }

  const error = domainToSpiErrorTranslator(err)
  res.status(error.httpCode).send(error.data)
}
