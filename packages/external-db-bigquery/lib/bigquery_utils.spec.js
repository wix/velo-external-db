const { Uninitialized } = require('test-commons')
const { unPatchDateTime } = require('./bigquery_utils')
const driver = require('./bigquery_utils_test_support')
const Chance = require('chance')
const chance = Chance()

describe('BigQuery Utils', () => {
    describe('unPatchDateTime Function', () => {
        test('Object with null value should be returned with null value', () => {        
            driver.givenNullValueTo(ctx.propertyName)

            expect( unPatchDateTime(env.bigQueryItem) ).toEqual({ [ctx.propertyName]: null })
        })

        test('Object with number value should contain number', () => {         
            driver.givenNumberValueTo(ctx.propertyName, ctx.randomNumber)
                        
            expect( unPatchDateTime(env.bigQueryItem) ).toEqual({ [ctx.propertyName]: ctx.randomNumber })
        })

        test('Object with date value should contain date object', () => {         
            driver.givenDateValueTo(ctx.propertyName, ctx.randomDate)
                        
            expect( unPatchDateTime(env.bigQueryItem) ).toEqual({ [ctx.propertyName]: ctx.randomDate })
        })

        test('Object with wrong date value should not be convert to date object', () => {         
            driver.givenWrongFormatDateValueTo(ctx.propertyName, ctx.randomDate)
                        
            expect( unPatchDateTime(env.bigQueryItem) ).toEqual({ [ctx.propertyName]: (ctx.randomDate).toISOString() })
        })

    })

    const ctx = {
        propertyName: Uninitialized,
        randomNumber: Uninitialized,
        randomDate: Uninitialized,
    }

    const env = {
        bigQueryItem: Uninitialized,
    }

    beforeEach(() => {
        ctx.propertyName = chance.word()
        ctx.randomNumber = chance.natural()
        ctx.randomDate = new Date(chance.date())
        driver.reset()
        env.bigQueryItem = driver.bigQueryItem
    })
})