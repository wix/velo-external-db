import { NextFunction, Response } from 'express'
import { domainToSpiErrorTranslator } from './domain-to-spi-error-translator'

export const errorMiddleware = (err: any, _req: any, res: Response, _next?: NextFunction) => {
  if (process.env['NODE_ENV'] !== 'test') {
    console.error(err)
  }


  console.log({err})

  const errorMsg = domainToSpiErrorTranslator(err)
  res.status(errorMsg.httpCode).send(errorMsg.message)
}
