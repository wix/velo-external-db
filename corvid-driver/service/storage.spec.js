const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const BadRequestError = require('../model/error/bad-request')
const NotFoundError = require('../model/error/not-found')

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Storage Service', () => {
  const selectStub = sinon.stub()
  const countStub = sinon.stub()
  const insertStub = sinon.stub()
  const updateStub = sinon.stub()
  const deleteOneStub = sinon.stub()
  const parseFilterStub = sinon.stub()
  const parseSortStub = sinon.stub()

  const service = proxyquire('./storage', {
    '../client/database': {
      select: selectStub,
      count: countStub,
      insert: insertStub,
      update: updateStub,
      deleteOne: deleteOneStub
    },
    './support/filter-parser': {
      parseFilter: parseFilterStub
    },
    './support/sort-parser': {
      parseSort: parseSortStub
    }
  })

  describe('find', () => {
    it('is rejected with an error when collectionName is missing', () => {
      const payload = {
        filter: {
          kind: 'filter',
          operator: '$eq',
          fieldName: 'foo',
          value: 'bar'
        },
        skip: 0,
        limit: 50
      }

      const call = service.find(payload)

      expect(call).to.eventually.be.rejectedWith(
        BadRequestError,
        'Missing collectionName in request body'
      )
    })

    it('is rejected with an error when skip is missing', () => {
      const payload = {
        collectionName: 'playground',
        filter: {
          kind: 'filter',
          operator: '$eq',
          fieldName: 'foo',
          value: 'bar'
        },
        limit: 50
      }

      const call = service.find(payload)

      expect(call).to.eventually.be.rejectedWith(
        BadRequestError,
        'Missing skip in request body'
      )
    })

    it('is rejected with an error when limit is missing', () => {
      const payload = {
        collectionName: 'playground',
        filter: {
          kind: 'filter',
          operator: '$eq',
          fieldName: 'foo',
          value: 'bar'
        },
        skip: 0
      }
      const call = service.find(payload)

      expect(call).to.eventually.be.rejectedWith(
        BadRequestError,
        'Missing limit in request body'
      )
    })

    it('is successful', () => {
      const payload = {
        collectionName: 'playground',
        filter: {
          kind: 'filter',
          operator: '$eq',
          fieldName: 'foo',
          value: 'bar'
        },
        sort: [
          {
            fieldName: 'foo',
            direction: 'asc'
          }
        ],
        skip: 0,
        limit: 50
      }
      const item = {
        _id: '42',
        foo: 'bar'
      }
      const query = 'fooQuery'
      const sortQuery = 'fooSortQuery'

      parseFilterStub.withArgs(payload.filter).returns(query)
      parseSortStub.withArgs(payload.sort).returns(sortQuery)
      selectStub
        .withArgs(payload.collectionName, query, sortQuery, 0, 50)
        .returns(Promise.resolve([item]))
      countStub
        .withArgs(payload.collectionName, query)
        .returns(Promise.resolve(1))

      const call = service.find(payload)

      expect(call).to.eventually.be.deep.equal({ items: [item], totalCount: 1 })
    })

    it('is successful for dates', () => {
      const payload = {
        collectionName: 'playground',
        filter: {
          kind: 'filter',
          operator: '$eq',
          fieldName: 'foo',
          value: 'bar'
        },
        sort: [
          {
            fieldName: 'foo',
            direction: 'asc'
          }
        ],
        skip: 0,
        limit: 50
      }
      const date = new Date()
      const item = {
        _id: '42',
        foo: date
      }
      const expected = {
        _id: '42',
        foo: {
          $date: date
        }
      }
      const query = 'fooQuery'
      const sortQuery = 'fooSortQuery'

      parseFilterStub.withArgs(payload.filter).returns(query)
      parseSortStub.withArgs(payload.sort).returns(sortQuery)
      selectStub
        .withArgs(payload.collectionName, query, sortQuery, 0, 50)
        .returns(Promise.resolve([item]))
      countStub
        .withArgs(payload.collectionName, query)
        .returns(Promise.resolve(1))

      const call = service.find(payload)

      expect(call).to.eventually.be.deep.equal({
        items: [expected],
        totalCount: 1
      })
    })
  })

  describe('get', () => {
    it('is rejected with an error when collectionName is missing', () => {
      const payload = {
        itemId: 'foo'
      }

      const call = service.get(payload)

      expect(call).to.eventually.be.rejectedWith(
        BadRequestError,
        'Missing collectionName in request body'
      )
    })

    it('is rejected with an error when itemId is missing', () => {
      const payload = {
        collectionName: 'playground'
      }

      const call = service.get(payload)

      expect(call).to.eventually.be.rejectedWith(
        BadRequestError,
        'Missing itemId in request body'
      )
    })

    it('is rejected with an error when item is not found', () => {
      const payload = {
        collectionName: 'playground',
        itemId: '42'
      }
      selectStub
        .withArgs(payload.collectionName, `WHERE _id = '${payload.itemId}'`)
        .returns([])

      const call = service.get(payload)

      expect(call).to.eventually.be.rejectedWith(
        NotFoundError,
        `Item with id ${payload.itemId} not found.`
      )
    })

    it('is successful', () => {
      const payload = {
        collectionName: 'playground',
        itemId: '42'
      }
      const item = {
        _id: '42',
        foo: 'bar'
      }
      selectStub
        .withArgs(payload.collectionName, `WHERE _id = '${payload.itemId}'`)
        .returns(Promise.resolve([item]))

      const call = service.get(payload)

      expect(call).to.eventually.be.deep.equal({ item })
    })

    it('is successful for dates', () => {
      const payload = {
        collectionName: 'playground',
        itemId: '42'
      }
      const date = new Date()
      const item = {
        _id: '42',
        foo: date
      }
      const expected = {
        _id: '42',
        foo: {
          $date: date
        }
      }

      selectStub
        .withArgs(payload.collectionName, `WHERE _id = '${payload.itemId}'`)
        .returns(Promise.resolve([item]))

      const call = service.get(payload)

      expect(call).to.eventually.be.deep.equal({ item: expected })
    })
  })

  describe('insert', () => {
    it('is rejected with an error when collectionName is missing', () => {
      const payload = {
        item: {
          _id: 'foo'
        }
      }

      const call = service.insert(payload)

      expect(call).to.eventually.be.rejectedWith(
        BadRequestError,
        'Missing collectionName in request body'
      )
    })

    it('is rejected with an error when item is missing', () => {
      const payload = {
        collectionName: 'playground'
      }

      const call = service.insert(payload)

      expect(call).to.eventually.be.rejectedWith(
        BadRequestError,
        'Missing item in request body'
      )
    })

    it('is successful', () => {
      const item = {
        _id: 'foo',
        key: 'value'
      }
      const payload = {
        collectionName: 'playground',
        item
      }
      insertStub
        .withArgs(payload.collectionName, payload.item)
        .returns(Promise.resolve(item))

      const call = service.insert(payload)

      expect(call).to.eventually.be.deep.equal({ item })
    })

    it('is succesful with defaulted _id', () => {
      const item = {
        key: 'value'
      }
      const payload = {
        collectionName: 'playground',
        item
      }
      const inserted = {
        _id: '42',
        key: 'value'
      }
      insertStub
        .withArgs(
          payload.collectionName,
          sinon.match(val => val._id && val.key === item.key)
        )
        .returns(Promise.resolve(inserted))

      const call = service.insert(payload)

      expect(call).to.eventually.be.deep.equal({ item: inserted })
    })
  })

  describe('update', () => {
    it('is rejected with an error when collectionName is missing', () => {
      const payload = {
        item: {
          _id: 'foo'
        }
      }

      const call = service.update(payload)

      expect(call).to.eventually.be.rejectedWith(
        BadRequestError,
        'Missing collectionName in request body'
      )
    })

    it('is rejected with an error when item is missing', () => {
      const payload = {
        collectionName: 'playground'
      }

      const call = service.update(payload)

      expect(call).to.eventually.be.rejectedWith(
        BadRequestError,
        'Missing item in request body'
      )
    })

    it('is successful', () => {
      const item = {
        _id: 'foo',
        key: 'value'
      }
      const payload = {
        collectionName: 'playground',
        item
      }
      updateStub
        .withArgs(payload.collectionName, payload.item)
        .returns(Promise.resolve(item))

      const call = service.update(payload)

      expect(call).to.eventually.be.deep.equal({ item })
    })
  })

  describe('remove', () => {
    it('is rejected with an error when collectionName is missing', () => {
      const payload = {
        itemId: 'foo'
      }

      const call = service.remove(payload)

      expect(call).to.eventually.be.rejectedWith(
        BadRequestError,
        'Missing collectionName in request body'
      )
    })

    it('is rejected with an error when itemId is missing', () => {
      const payload = {
        collectionName: 'playground'
      }

      const call = service.remove(payload)

      expect(call).to.eventually.be.rejectedWith(
        BadRequestError,
        'Missing itemId in request body'
      )
    })

    it('is rejected with an error when item does not exist', () => {
      const payload = {
        collectionName: 'playground',
        itemId: 'foo'
      }
      const item = {
        _id: 'foo',
        bar: 'baz'
      }
      selectStub
        .withArgs(payload.collectionName, `WHERE _id = '${payload.itemId}'`)
        .returns(Promise.resolve([item]))
      deleteOneStub
        .withArgs(payload.collectionName, payload.itemId)
        .returns(Promise.resolve(0))

      const call = service.remove(payload)

      expect(call).to.eventually.be.rejectedWith(
        NotFoundError,
        `Item with id ${payload.itemId} does not exist.`
      )
    })

    it('is successful', () => {
      const payload = {
        collectionName: 'playground',
        itemId: 'foo'
      }
      const item = {
        _id: 'foo',
        bar: 'baz'
      }
      selectStub
        .withArgs(payload.collectionName, `WHERE _id = '${payload.itemId}'`)
        .returns(Promise.resolve([item]))
      deleteOneStub
        .withArgs(payload.collectionName, payload.itemId)
        .returns(Promise.resolve(1))

      const call = service.remove(payload)

      expect(call).to.eventually.be.deep.equal({ item })
    })

    it('is successful for dates', () => {
      const payload = {
        collectionName: 'playground',
        itemId: 'foo'
      }
      const date = new Date()
      const item = {
        _id: 'foo',
        bar: date
      }
      const expected = {
        _id: 'foo',
        bar: {
          $date: date
        }
      }

      selectStub
        .withArgs(payload.collectionName, `WHERE _id = '${payload.itemId}'`)
        .returns(Promise.resolve([item]))
      deleteOneStub
        .withArgs(payload.collectionName, payload.itemId)
        .returns(Promise.resolve(1))

      const call = service.remove(payload)

      expect(call).to.eventually.be.deep.equal({ item: expected })
    })
  })

  describe('count', () => {
    it('is rejected with an error when collectionName is missing', () => {
      const payload = {}

      const call = service.count(payload)

      expect(call).to.eventually.be.rejectedWith(
        BadRequestError,
        'Missing collectionName in request body'
      )
    })

    it('is successful', () => {
      const payload = {
        collectionName: 'playground'
      }
      countStub.withArgs('playground').returns(42)

      const call = service.count(payload)

      expect(call).to.eventually.be.deep.equal({
        totalCount: 42
      })
    })
  })
})
