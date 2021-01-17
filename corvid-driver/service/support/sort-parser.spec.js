const { assert } = require('chai')
const { parseSort } = require('./sort-parser')

describe('Sort Parser', () => {
  describe('parseSort', () => {
    it('handles undefined sort', async () => {
      const sort = undefined

      const result = parseSort(sort)

      assert.equal(result, '')
    })

    it('handles null sort', async () => {
      const sort = null

      const result = parseSort(sort)

      assert.equal(result, '')
    })

    it('handles empty sort', async () => {
      const sort = []

      const result = parseSort(sort)

      assert.equal(result, '')
    })

    it('handles single sort', async () => {
      const sort = [{ fieldName: 'foo', direction: 'asc' }]

      const result = parseSort(sort)

      assert.equal(result, 'ORDER BY foo ASC')
    })

    it('handles multiple sort', async () => {
      const sort = [
        { fieldName: 'foo', direction: 'asc' },
        { fieldName: 'bar', direction: 'desc' }
      ]

      const result = parseSort(sort)

      assert.equal(result, 'ORDER BY foo ASC, bar DESC')
    })
  })
})
