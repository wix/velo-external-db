const { when } = require('jest-when')
const { unPatchDateTime } = require('./bigquery_utils')

describe('BigQuery Utils', () => {
    describe('unPatchDateTime', () => {
        test('Object with null value should be returned untouched', () => {
            const objectWithNullValue = { a: null }
        
            const actual = unPatchDateTime(objectWithNullValue)

            expect(actual).toEqual(objectWithNullValue)
        })

        test('Object with number value should be contain number', () => {
            const bigQueryNumber = {
                toNumber: jest.fn(),
            }           
            when(bigQueryNumber.toNumber).calledWith().mockReturnValue(42) 
            const objectWithNumber = { a: bigQueryNumber }
            
            const actual = unPatchDateTime(objectWithNumber)

            expect(actual).toEqual({ a: 42 })
        })
    })
})