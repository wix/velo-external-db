const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinon = require('sinon')

chai.use(chaiAsPromised)

const controller = require('./schemas')
const Schema = require('../service/schema')
const sandbox = sinon.createSandbox()

describe('Schemas Controller', () => {
  afterEach(() => {
    sandbox.restore()
  })

  describe('findSchemas', () => {
    it('calls schema and responds with JSON', async () => {
      const req = { body: 42 }
      const payload = { foo: 'bar' }
      sandbox
        .stub(Schema, 'find')
        .withArgs(req.body)
        .returns(payload)
      const jsonResponseHandler = sandbox.stub()
      const responseHandlers = { json: jsonResponseHandler }

      await controller.findSchemas(req, responseHandlers)

      sandbox.assert.calledOnce(jsonResponseHandler)
      sandbox.assert.calledWith(jsonResponseHandler, payload)
    })
  })

  describe('listSchemas', () => {
    it('calls schema and responds with JSON', async () => {
      const req = { body: 42 }
      const payload = { foo: 'bar' }
      sandbox
        .stub(Schema, 'list')
        .withArgs(req.body)
        .returns(payload)
      const jsonResponseHandler = sandbox.stub()
      const responseHandlers = { json: jsonResponseHandler }

      await controller.listSchemas(req, responseHandlers)

      sandbox.assert.calledOnce(jsonResponseHandler)
      sandbox.assert.calledWith(jsonResponseHandler, payload)
    })
  })
})
