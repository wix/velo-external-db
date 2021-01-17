const { expect, assert } = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru()

const BadRequestError = require('../model/error/bad-request')
const UnauthorizedError = require('../model/error/unauthorized')

describe('Auth Middleware', () => {
  describe('authMiddleware', () => {
    const secretKey = 'wix-big-secret' // 'bird-is-the-word'
    const loadStub = sinon.stub()
    loadStub.withArgs(sinon.match.any).returns({ secretKey })
    const authMiddleware = require('./auth-middleware') //, {
    //   './file-loader': {
    //     load: loadStub
    //   }
    // })

    it('should throw when requestContext is missing', () => {
      const request = {
        body: {}
      }

      const throwing = () => authMiddleware(request)

      assert.throws(throwing, BadRequestError, 'Missing request context')
    })

    it('should throw when settings are not in requestContext', () => {
      const request = {
        body: {
          requestContext: {}
        }
      }

      const throwing = () => authMiddleware(request)

      assert.throws(
        throwing,
        UnauthorizedError,
        'Missing secret key in request context'
      )
    })

    it('should throw when secret key is not in settings', () => {
      const request = {
        body: {
          requestContext: {
            settings: {}
          }
        }
      }

      const throwing = () => authMiddleware(request)

      assert.throws(throwing, UnauthorizedError, 'Missing secret key in request context')
    })

    it('should throw when secret key does not match', () => {
      const request = {
        body: {
          requestContext: {
            settings: {
              secretKey: 'kaboom'
            }
          }
        }
      }

      const throwing = () => authMiddleware(request)

      assert.throws(
        throwing,
        UnauthorizedError,
        'Provided secret key does not match'
      )
    })

    it('should call next when secret key matches', () => {
      const next = sinon.mock()
      const request = {
        body: {
          requestContext: {
            settings: {
              secretKey
            }
          }
        }
      }

      authMiddleware(request, null, next)

      sinon.assert.calledOnce(next)
    })
  })
})
