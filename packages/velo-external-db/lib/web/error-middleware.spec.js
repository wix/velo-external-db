const Chance = require('chance')
const chance = Chance()
const errors = require('velo-external-db-commons').errors
const { errorMiddleware } = require('./error-middleware')

describe('Error Middleware', () => {
  const ctx = {
    res: null,
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
