const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinon = require('sinon')

chai.use(chaiAsPromised)

const controller = require('./provision')
const Schema = require('../service/schema')
const sandbox = sinon.createSandbox()

describe('Provision Controller', () => {
  afterEach(() => {
    sandbox.restore()
  })

  describe('provision', () => {
    it('calls schema and responds with JSON', async () => {
      const req = { body: 42 }
      const payload = { foo: 'bar' }
      sandbox
        .stub(Schema, 'provision')
        .withArgs(req.body)
        .returns(payload)
      const jsonResponseHandler = sandbox.stub()
      const responseHandlers = { json: jsonResponseHandler }

      await controller.provision(req, responseHandlers)

      sandbox.assert.calledOnce(jsonResponseHandler)
      sandbox.assert.calledWith(jsonResponseHandler, payload)
    })
  })
})
