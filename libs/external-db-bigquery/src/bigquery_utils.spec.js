const { Uninitialized } = require('@wix-velo/test-commons')
const { unPatchDateTime } = require('./bigquery_utils')
const driver = require('./bigquery_utils_test_support')
const Chance = require('chance')
const chance = Chance()

describe('BigQuery Utils', () => {
    describe('unPatchDateTime Function', () => {
        test('Object with a null value should contain a null field', () => {        
            driver.givenNullValueTo(ctx.propertyName)

            expect( unPatchDateTime(env.bigQueryItem) ).toEqual({ [ctx.propertyName]: null })
        })

        test('Object with a number value should contain a number field', () => {         
            driver.givenNumberValueTo(ctx.propertyName, ctx.randomNumber)
                        
            expect( unPatchDateTime(env.bigQueryItem) ).toEqual({ [ctx.propertyName]: ctx.randomNumber })
        })

        test('Object with a date object value should contain a date object', () => {         
            driver.givenDateValueTo(ctx.propertyName, ctx.randomDate)
                        
            expect( unPatchDateTime(env.bigQueryItem) ).toEqual({ [ctx.propertyName]: ctx.randomDate })
        })

        test('Object with a date string value should not be converted to a date object', () => {         
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