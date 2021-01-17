const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinon = require('sinon')

chai.use(chaiAsPromised)

const controller = require('./items')
const Storage = require('../service/storage')
const sandbox = sinon.createSandbox()

describe('Items Controller', () => {
  afterEach(() => {
    sandbox.restore()
  })

  describe('findItems', () => {
    it('calls storage and responds with JSON', async () => {
      const req = { body: 42 }
      const payload = { foo: 'bar' }
      sandbox
        .stub(Storage, 'find')
        .withArgs(req.body)
        .returns(payload)
      const jsonResponseHandler = sandbox.stub()
      const responseHandlers = { json: jsonResponseHandler }

      await controller.findItems(req, responseHandlers)

      sandbox.assert.calledOnce(jsonResponseHandler)
      sandbox.assert.calledWith(jsonResponseHandler, payload)
    })
  })

  describe('getItem', () => {
    it('calls storage and responds with JSON', async () => {
      const req = { body: 42 }
      const payload = { foo: 'bar' }
      sandbox
        .stub(Storage, 'get')
        .withArgs(req.body)
        .returns(payload)
      const jsonResponseHandler = sandbox.stub()
      const responseHandlers = { json: jsonResponseHandler }

      await controller.getItem(req, responseHandlers)

      sandbox.assert.calledOnce(jsonResponseHandler)
      sandbox.assert.calledWith(jsonResponseHandler, payload)
    })
  })

  describe('insertItem', () => {
    it('calls storage and responds with JSON', async () => {
      const req = { body: 42 }
      const payload = { foo: 'bar' }
      sandbox
        .stub(Storage, 'insert')
        .withArgs(req.body)
        .returns(payload)
      const jsonResponseHandler = sandbox.stub()
      const responseHandlers = { json: jsonResponseHandler }

      await controller.insertItem(req, responseHandlers)

      sandbox.assert.calledOnce(jsonResponseHandler)
      sandbox.assert.calledWith(jsonResponseHandler, payload)
    })
  })

  describe('updateItem', () => {
    it('calls storage and responds with JSON', async () => {
      const req = { body: 42 }
      const payload = { foo: 'bar' }
      sandbox
        .stub(Storage, 'update')
        .withArgs(req.body)
        .returns(payload)
      const jsonResponseHandler = sandbox.stub()
      const responseHandlers = { json: jsonResponseHandler }

      await controller.updateItem(req, responseHandlers)

      sandbox.assert.calledOnce(jsonResponseHandler)
      sandbox.assert.calledWith(jsonResponseHandler, payload)
    })
  })

  describe('removeItem', () => {
    it('calls storage and responds with JSON', async () => {
      const req = { body: 42 }
      const payload = { foo: 'bar' }
      sandbox
        .stub(Storage, 'remove')
        .withArgs(req.body)
        .returns(payload)
      const jsonResponseHandler = sandbox.stub()
      const responseHandlers = { json: jsonResponseHandler }

      await controller.removeItem(req, responseHandlers)

      sandbox.assert.calledOnce(jsonResponseHandler)
      sandbox.assert.calledWith(jsonResponseHandler, payload)
    })
  })

  describe('countItems', () => {
    it('calls storage and responds with JSON', async () => {
      const req = { body: 42 }
      const payload = { foo: 'bar' }
      sandbox
        .stub(Storage, 'count')
        .withArgs(req.body)
        .returns(payload)
      const jsonResponseHandler = sandbox.stub()
      const responseHandlers = { json: jsonResponseHandler }

      await controller.countItems(req, responseHandlers)

      sandbox.assert.calledOnce(jsonResponseHandler)
      sandbox.assert.calledWith(jsonResponseHandler, payload)
    })
  })
})
