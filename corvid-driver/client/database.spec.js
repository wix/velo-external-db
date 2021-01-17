const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru()

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Database', () => {

  process.env['SQL_CONFIG'] = '{ "database":"fooDb" }'
  const escapeStub = sinon.stub()
  const queryStub = sinon.stub()

  const sqlConfig = { database: 'fooDb' }
  const createConnectionStub = sinon
    .stub()
    .withArgs(sqlConfig)
    .returns({
      escape: escapeStub,
      query: queryStub
    })

  const service = proxyquire('./database', {
    mysql: {
      createConnection: createConnectionStub
    }
  })

  afterEach(() => {
    escapeStub.reset()
    queryStub.reset()
  })

  describe('select', () => {
    it('is successful', () => {
      const table = 'fooTable'
      const clause = "WHERE _id = 'corvid'"
      const sortClause = "ORDER BY '_id' asc"
      const skip = 0
      const limit = 50
      const expectedQuery = `SELECT * FROM ${table} ${clause} ${sortClause} LIMIT ${skip}, ${limit}`
      const expected = sinon.mock()

      const call = service.select(table, clause, sortClause, skip, limit)

      const actualQuery = queryStub.getCall(0).args[0]
      const callback = queryStub.getCall(0).args[2]
      callback(null, expected, null)
      expect(actualQuery).to.equal(expectedQuery)
      expect(call).to.eventually.be.equal(expected)
    })

    it('is rejected', () => {
      const table = 'fooTable'
      const clause = "WHERE _id = 'corvid'"
      const sortClause = ''
      const skip = 0
      const limit = 50
      const expectedQuery = `SELECT * FROM ${table} ${clause} ${sortClause} LIMIT ${skip}, ${limit}`
      const err = new Error('BirdIsTheWord')

      const call = service.select(table, clause, sortClause, skip, limit)

      const actualQuery = queryStub.getCall(0).args[0]
      const callback = queryStub.getCall(0).args[2]
      callback(err, null, null)
      expect(actualQuery).to.equal(expectedQuery)
      expect(call).to.eventually.be.rejectedWith(err)
    })
  })

  describe('insert', () => {
    it('is successful', () => {
      const table = 'fooTable'
      const item = {
        _id: 'foo',
        key: 'value'
      }
      const expectedQuery = `INSERT INTO ${table} SET ?`

      const call = service.insert(table, { ...item })

      const actualQuery = queryStub.getCall(0).args[0]
      const actualValues = queryStub.getCall(0).args[1]
      const callback = queryStub.getCall(0).args[2]
      callback(null, {}, null)
      expect(actualQuery).to.equal(expectedQuery)
      expect(actualValues).to.deep.equal(item)
      expect(call).to.eventually.be.deep.equal(item)
    })
  })

  describe('update', () => {
    it('is successful', () => {
      const table = 'fooTable'
      const item = {
        _id: 'foo',
        key: 'value'
      }
      const escaped = 'birdIsTheWord'
      escapeStub.withArgs(item._id).returns(escaped)
      const expectedQuery = `UPDATE ${table} SET ? WHERE _id = ${escaped}`

      const call = service.update(table, { ...item })

      const actualQuery = queryStub.getCall(0).args[0]
      const actualValues = queryStub.getCall(0).args[1]
      const callback = queryStub.getCall(0).args[2]
      callback(null, {}, null)
      expect(actualQuery).to.equal(expectedQuery)
      expect(actualValues).to.deep.equal(item)
      expect(call).to.eventually.be.deep.equal(item)
    })
  })

  describe('deleteOne', () => {
    it('is successful', () => {
      const table = 'fooTable'
      const itemId = 'foo'
      const escaped = 'birdIsTheWord'
      escapeStub.withArgs(itemId).returns(escaped)
      const expectedQuery = `DELETE FROM ${table} WHERE _id = ${escaped}`

      const call = service.deleteOne(table, itemId)

      const actualQuery = queryStub.getCall(0).args[0]
      const callback = queryStub.getCall(0).args[2]
      callback(
        null,
        {
          affectedRows: 42
        },
        null
      )
      expect(actualQuery).to.equal(expectedQuery)
      expect(call).to.eventually.be.deep.equal(42)
    })
  })

  describe('count', () => {
    it('is successful', () => {
      const table = 'fooTable'
      const clause = 'WHERE _id = 123'
      const expectedQuery = `SELECT COUNT(*) FROM ${table} ${clause}`

      const call = service.count(table, clause)

      const actualQuery = queryStub.getCall(0).args[0]
      const callback = queryStub.getCall(0).args[2]
      callback(null, [{ 'COUNT(*)': 42 }], null)
      expect(actualQuery).to.equal(expectedQuery)
      expect(call).to.eventually.be.equal(42)
    })
  })

  describe('describeDatabase', () => {
    it('is successful', () => {
      const tableName = 'fooTable'
      const expectedQuery = 'SHOW TABLES'
      const expectedSecondQuery = `DESCRIBE ${tableName}`
      const expectedResult = [
        {
          table: tableName,
          columns: [
            {
              name: '_id',
              type: 'text',
              isPrimary: true
            }
          ]
        }
      ]

      const call = service.describeDatabase()

      const actualQuery = queryStub.getCall(0).args[0]
      const callback = queryStub.getCall(0).args[2]
      callback(
        null,
        [
          {
            Tables_in_fooDb: tableName
          }
        ],
        null
      )
      expect(actualQuery).to.equal(expectedQuery)

      const actualSecondQuery = queryStub.getCall(1).args[0]
      const secondCallback = queryStub.getCall(1).args[2]
      secondCallback(
        null,
        [
          {
            Field: '_id',
            Type: 'text',
            Key: 'PRI'
          }
        ],
        null
      )
      expect(actualSecondQuery).to.equal(expectedSecondQuery)
      expect(call).to.eventually.deep.equal(expectedResult)
    })
  })
})
