const { assert } = require('chai')
const sinon = require('sinon')

const supportedOperators = [
  'eq',
  'lt',
  'gt',
  'hasSome',
  'and',
  'lte',
  'gte',
  'or',
  'not',
  'ne',
  'startsWith',
  'endsWith'
]

const aTable = (...columns) => {
  return {
    table: 'MockTable',
    columns
  }
}

describe('Table Converter', () => {
  //const fileLoaderStub = sinon.stub(process.env.ALLOWED_OPERATIONS).value([]);
  
  const convert = require('./table-converter').convert

  describe('convert base', () => {
    it('converts basic table data correctly', async () => {
      
      const table = aTable()
      const mockAllowedOperations = ['foo', 'bar']
      process.env['ALLOWED_OPERATIONS'] = '["foo", "bar"]';
      
      const result = convert(table)

      assert.equal(result.displayName, table.table)
      assert.equal(result.id, table.table)
      assert.deepEqual(result.allowedOperations, mockAllowedOperations)
      assert.equal(result.id, table.table)
      assert.equal(result.maxPageSize, 50)
      assert.equal(result.ttl, 3600)
    })
  })

  describe('convert', () => {
    
    it('converts multiple fields correctly', async () => {
      const table = aTable(
        {
          name: 'foo',
          type: 'varchar'
        },
        {
          name: 'bar',
          type: 'decimal'
        }
      )
      const expectedFields = {
        foo: {
          displayName: 'foo',
          type: 'text',
          queryOperators: supportedOperators
        },
        bar: {
          displayName: 'bar',
          type: 'number',
          queryOperators: supportedOperators
        }
      }

      const result = convert(table)

      assert.deepEqual(result.fields, expectedFields)
    })

    it('converts varchar column correctly', async () => {
      const table = aTable({
        name: 'foo',
        type: 'varchar'
      })
      const expectedFields = {
        foo: {
          displayName: 'foo',
          type: 'text',
          queryOperators: supportedOperators
        }
      }

      const result = convert(table)

      assert.deepEqual(result.fields, expectedFields)
    })

    it('converts text column correctly', async () => {
      const table = aTable({
        name: 'foo',
        type: 'text'
      })
      const expectedFields = {
        foo: {
          displayName: 'foo',
          type: 'text',
          queryOperators: supportedOperators
        }
      }

      const result = convert(table)

      assert.deepEqual(result.fields, expectedFields)
    })

    it('converts decimal column correctly', async () => {
      const table = aTable({
        name: 'foo',
        type: 'decimal'
      })
      const expectedFields = {
        foo: {
          displayName: 'foo',
          type: 'number',
          queryOperators: supportedOperators
        }
      }

      const result = convert(table)

      assert.deepEqual(result.fields, expectedFields)
    })

    it('converts bigint column correctly', async () => {
      const table = aTable({
        name: 'foo',
        type: 'bigint'
      })
      const expectedFields = {
        foo: {
          displayName: 'foo',
          type: 'number',
          queryOperators: supportedOperators
        }
      }

      const result = convert(table)

      assert.deepEqual(result.fields, expectedFields)
    })

    it('converts int column correctly', async () => {
      const table = aTable({
        name: 'foo',
        type: 'int'
      })
      const expectedFields = {
        foo: {
          displayName: 'foo',
          type: 'number',
          queryOperators: supportedOperators
        }
      }

      const result = convert(table)

      assert.deepEqual(result.fields, expectedFields)
    })

    it('converts tinyint column correctly', async () => {
      const table = aTable({
        name: 'foo',
        type: 'tinyint'
      })
      const expectedFields = {
        foo: {
          displayName: 'foo',
          type: 'boolean',
          queryOperators: supportedOperators
        }
      }

      const result = convert(table)

      assert.deepEqual(result.fields, expectedFields)
    })

    it('converts date column correctly', async () => {
      const table = aTable({
        name: 'foo',
        type: 'date'
      })
      const expectedFields = {
        foo: {
          displayName: 'foo',
          type: 'datetime',
          queryOperators: supportedOperators
        }
      }

      const result = convert(table)

      assert.deepEqual(result.fields, expectedFields)
    })

    it('converts time column correctly', async () => {
      const table = aTable({
        name: 'foo',
        type: 'time'
      })
      const expectedFields = {
        foo: {
          displayName: 'foo',
          type: 'datetime',
          queryOperators: supportedOperators
        }
      }

      const result = convert(table)

      assert.deepEqual(result.fields, expectedFields)
    })

    it('converts datetime column correctly', async () => {
      const table = aTable({
        name: 'foo',
        type: 'datetime'
      })
      const expectedFields = {
        foo: {
          displayName: 'foo',
          type: 'datetime',
          queryOperators: supportedOperators
        }
      }

      const result = convert(table)

      assert.deepEqual(result.fields, expectedFields)
    })

    it('converts json column correctly', async () => {
      const table = aTable({
        name: 'foo',
        type: 'json'
      })
      const expectedFields = {
        foo: {
          displayName: 'foo',
          type: 'object',
          queryOperators: supportedOperators
        }
      }

      const result = convert(table)

      assert.deepEqual(result.fields, expectedFields)
    })

    it('converts unknown column correctly', async () => {
      const table = aTable({
        name: 'foo',
        type: '42'
      })
      const expectedFields = {
        foo: {
          displayName: 'foo',
          type: 'object',
          queryOperators: supportedOperators
        }
      }

      const result = convert(table)

      assert.deepEqual(result.fields, expectedFields)
    })
  })
})
