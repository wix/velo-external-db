import * as Chance from 'chance'
import { errors } from '@wix-velo/velo-external-db-commons'
import { errorMiddleware } from './error-middleware'
import { Uninitialized } from '@wix-velo/test-commons'
import { domainToSpiErrorTranslator } from './domain-to-spi-error-translator'

const chance = Chance()

describe('Error Middleware', () => {
  const ctx = {
    res: Uninitialized,
  }

  beforeEach(() => {
    ctx.res = {
      status: jest.fn().mockName('status').mockReturnThis(),
      send: jest.fn().mockName('send').mockReturnThis()
    }
  })

  describe('errorMiddleware', () => {

    test('converts unknown error with message and default status code of 500', () => {
      const err = new Error(chance.word())

      errorMiddleware()(err, null, ctx.res)

      expect(ctx.res.status).toHaveBeenCalledWith(500)
      expect(ctx.res.send).toHaveBeenCalledWith( { data: { description: err.message }, errorCode: 'UNKNOWN_ERROR' } )
    })

    test.each(Object.entries(errors))('converts %s to http error response', (ExceptionName, ExceptionClass) => {
              const err = new ExceptionClass(chance.word())
              errorMiddleware()(err, null, ctx.res)
              const spiError = domainToSpiErrorTranslator(err)

              expect(ctx.res.status).toHaveBeenCalledWith(spiError.httpCode)
              expect(ctx.res.send).toHaveBeenCalledWith({
                data: spiError.data,
                errorCode: spiError.errorCode
              })

              ctx.res.status.mockClear()
              ctx.res.send.mockClear()

      })

  })
})
