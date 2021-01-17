const { expect } = require('chai')
const sinon = require('sinon')

const BadRequestError = require('../model/error/bad-request')
const AlreadyExistsError = require('../model/error/already-exists')
const NotFoundError = require('../model/error/not-found')
const UnauthorizedError = require('../model/error/unauthorized')
const { errorMiddleware } = require('./error-middleware')

describe('Error Middleware', () => {
  const res = {
    status: sinon.mock(),
    send: sinon.mock()
  }

  afterEach(() => {
    res.status.reset()
    res.send.reset()
  })

  describe('errorMiddleware', () => {
    it('converts bad request error', () => {
      const err = new BadRequestError('bird-is-the-word')
      res.status.withArgs(400).returns(res)

      errorMiddleware(err, null, res)

      sinon.assert.calledOnce(res.status)
      sinon.assert.calledOnce(res.send)
      sinon.assert.calledWith(res.send, { message: err.message })
    })

    it('converts already exists error', () => {
      const err = new AlreadyExistsError('bird-is-the-word')
      res.status.withArgs(409).returns(res)

      errorMiddleware(err, null, res)

      sinon.assert.calledOnce(res.status)
      sinon.assert.calledOnce(res.send)
      sinon.assert.calledWith(res.send, { message: err.message })
    })

    it('converts unauthorized error', () => {
      const err = new UnauthorizedError('bird-is-the-word')
      res.status.withArgs(401).returns(res)

      errorMiddleware(err, null, res)

      sinon.assert.calledOnce(res.status)
      sinon.assert.calledOnce(res.send)
      sinon.assert.calledWith(res.send, { message: err.message })
    })

    it('converts not found error', () => {
      const err = new NotFoundError('bird-is-the-word')
      res.status.withArgs(404).returns(res)

      errorMiddleware(err, null, res)

      sinon.assert.calledOnce(res.status)
      sinon.assert.calledOnce(res.send)
      sinon.assert.calledWith(res.send, { message: err.message })
    })

    it('converts unknown error', () => {
      const err = new Error('bird-is-the-word')
      res.status.withArgs(500).returns(res)

      errorMiddleware(err, null, res)

      sinon.assert.calledOnce(res.status)
      sinon.assert.calledOnce(res.send)
      sinon.assert.calledWith(res.send, { message: err.message })
    })
  })
})
