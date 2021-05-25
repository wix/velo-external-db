const Chance = require('chance')
const chance = Chance();
const errors = require('../error/errors')
const { errorMiddleware } = require('./error-middleware')

describe.skip('Error Middleware', () => {
  const ctx = {
    res: null,
  }

  beforeEach(() => {
    ctx.res = {
      status: jest.fn().mockName('status').mockReturnThis()/*.mockName('status')*/,
      send: jest.fn().mockName('send').mockReturnThis()/*.mockName('send')*/
    }
  })

  describe('errorMiddleware', () => {

    it('converts unknown error with message and default status code of 500', () => {
      const err = new Error(chance.word())

      errorMiddleware(err, null, ctx.res)

      expect(ctx.res.status).toHaveBeenCalledWith(500)
      expect(ctx.res.send).toHaveBeenCalledWith( { message: err.message } )
    })

    it('converts exceptions to http error response', () => {
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
