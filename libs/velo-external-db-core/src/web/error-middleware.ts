import { NextFunction, Response } from 'express'

export const errorMiddleware = (err: any, _req: any, res: Response, _next?: NextFunction) => {
  if (process.env['NODE_ENV'] === 'test') {
    console.error(err)
  }
  res.status(err.status || 500)
     .send({ message: err.message })
}
