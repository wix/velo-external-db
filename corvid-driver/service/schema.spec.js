const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

chai.use(chaiAsPromised)
const expect = chai.expect

const BadRequestError = require('../model/error/bad-request')

describe('Schema Service', () => {
  const describeDatabaseStub = sinon.stub()
  const convertStub = sinon.stub()

  const service = proxyquire('./schema', {
    '../client/database': {
      describeDatabase: describeDatabaseStub
    },
    './support/table-converter': {
      convert: convertStub
    }
  })

  afterEach(() => {
    describeDatabaseStub.reset()
    convertStub.reset()
  })

  describe('find', () => {
    it('is rejected when schemaIds are missing', () => {
      const call = service.find({
        requestContext: 'foo'
      })

      expect(call).to.eventually.be.rejectedWith(
        BadRequestError,
        'Missing schemaIds in request body'
      )
    })

    it('is successful', async () => {
      const payload = {
        schemaIds: ['present']
      }
      const table1 = {
        table: 'present',
        columns: []
      }
      const table2 = {
        table: 'shouldBeFiltered',
        columns: []
      }
      const schema1 = {
        id: 'present',
        foo: 'bar'
      }
      const schema2 = {
        id: 'shouldBeFiltered',
        bar: 'baz'
      }
      describeDatabaseStub.returns(Promise.resolve([table1, table2]))
      convertStub.withArgs(table1).returns(schema1)
      convertStub.withArgs(table2).returns(schema2)

      const result = await service.find(payload)

      expect(result.schemas.length).to.equal(1)
      expect(result.schemas.shift()).to.deep.equal(schema1)
    })
  })

  describe('list', () => {
    it('is successful', async () => {
      const payload = {
        schemaIds: ['playground']
      }
      const table = {
        table: 'playground',
        columns: []
      }
      const schema = {
        id: 'playground',
        foo: 'bar'
      }
      describeDatabaseStub.returns(Promise.resolve([table]))
      convertStub.withArgs(table).returns(schema)

      const result = await service.list(payload)

      expect(result.schemas.length).to.equal(1)
      expect(result.schemas.shift()).to.deep.equal(schema)
    })
  })

  describe('provision', () => {
    it('is rejected with an error', () => {
      describeDatabaseStub.returns(Promise.resolve([]))

      const call = service.provision()

      sinon.assert.calledOnce(describeDatabaseStub)
      expect(call).to.eventually.be.deep.equal({})
    })
  })
})
