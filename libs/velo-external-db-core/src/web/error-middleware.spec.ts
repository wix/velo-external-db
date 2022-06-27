import * as Chance from 'chance'
import { errors } from '@wix-velo/velo-external-db-commons'
import { errorMiddleware } from './error-middleware'
import { Uninitialized } from '@wix-velo/test-commons'
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

      errorMiddleware(err, null, ctx.res)

      expect(ctx.res.status).toHaveBeenCalledWith(500)
      expect(ctx.res.send).toHaveBeenCalledWith( { message: err.message } )
    })

    test('converts exceptions to http error response', () => {
      Object.values(errors)
            .forEach(Exception => {
              const err = new Exception(chance.word())
              errorMiddleware(err, null, ctx.res)

              expect(ctx.res.status).toHaveBeenCalledWith(err.status)
              expect(ctx.res.send).toHaveBeenCalledWith( { message: err.message } )

              ctx.res.status.mockClear()
              ctx.res.send.mockClear()

      })
    })
  })
})
