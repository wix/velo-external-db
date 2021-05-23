const sinon = require('sinon')
const Chance = require('chance')
const chance = Chance();

// const BadRequestError = require('../model/error/bad-request')
// const AlreadyExistsError = require('../model/error/already-exists')
// const NotFoundError = require('../model/error/not-found')
// const UnauthorizedError = require('../model/error/unauthorized')
const { errorMiddleware } = require('./error-middleware')

describe.skip('Error Middleware', () => {
  const ctx = {
    res: null,
  }

  beforeEach(() => {
    ctx.res = {
      status: sinon.mock(),
      send: sinon.mock()
    }
  })

  describe('errorMiddleware', () => {

    it('converts unknown error', () => {
      const err = new Error(chance.word())
      ctx.res.status.withArgs(500).returns(ctx.res)

      errorMiddleware(err, null, ctx.res)

      sinon.assert.calledOnce(ctx.res.status)
      // sinon.assert.calledOnce(ctx.res.send)
      sinon.assert.calledWith(ctx.res.send, { message: err.message })
    })


    it('converts bad request error', () => {
      const err = new BadRequestError('bird-is-the-word')
      res.status.withArgs(400).returns(ctx.res)

      errorMiddleware(err, null, ctx.res)

      sinon.assert.calledOnce(res.status)
      sinon.assert.calledOnce(res.send)
      sinon.assert.calledWith(res.send, { message: err.message })
    })

    // it('converts already exists error', () => {
    //   const err = new AlreadyExistsError('bird-is-the-word')
    //   res.status.withArgs(409).returns(res)
    //
    //   errorMiddleware(err, null, res)
    //
    //   sinon.assert.calledOnce(res.status)
    //   sinon.assert.calledOnce(res.send)
    //   sinon.assert.calledWith(res.send, { message: err.message })
    // })
    //
    // it('converts unauthorized error', () => {
    //   const err = new UnauthorizedError('bird-is-the-word')
    //   res.status.withArgs(401).returns(res)
    //
    //   errorMiddleware(err, null, res)
    //
    //   sinon.assert.calledOnce(res.status)
    //   sinon.assert.calledOnce(res.send)
    //   sinon.assert.calledWith(res.send, { message: err.message })
    // })
    //
    // it('converts not found error', () => {
    //   const err = new NotFoundError('bird-is-the-word')
    //   res.status.withArgs(404).returns(res)
    //
    //   errorMiddleware(err, null, res)
    //
    //   sinon.assert.calledOnce(res.status)
    //   sinon.assert.calledOnce(res.send)
    //   sinon.assert.calledWith(res.send, { message: err.message })
    // })
    //
  })
})
