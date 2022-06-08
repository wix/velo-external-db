const { asWixData, generateIdsIfNeeded } = require ('./data_utils')
const { Uninitialized, gen } = require('@wix-velo/test-commons')
const Chance = require('chance')
const chance = Chance()
const dateTimeProvider = require('../../test/drivers/date_time_provider_test_support')

describe('Converters', () => {
    test('pack dates will duplicate object and do nothing is date is not there', async() => {
        expect(asWixData(ctx.obj)).toMatchObject(ctx.obj)
    })

    test('pack dates will take all properties with date and convert them to velo date', async() => {
        const objWithJsDates = { ...ctx.obj, [ctx.property]: dateTimeProvider.currentDateTime(),
                                             [ctx.anotherProperty]: dateTimeProvider.currentDateTime() }

        expect(asWixData(objWithJsDates)).toMatchObject( { ...ctx.obj, [ctx.property]: { $date: dateTimeProvider.currentDateTime().toISOString() },
                                                                          [ctx.anotherProperty]: { $date: dateTimeProvider.currentDateTime().toISOString() } } )
    })

    test('if _id field exists do nothing', async() => {
        expect(generateIdsIfNeeded({ ...ctx.obj, _id: 'something' })).toEqual( { ...ctx.obj, _id: 'something' } )
    })

    test('if _id field does not exist generate id', async() => {
        expect(generateIdsIfNeeded(ctx.obj)).toHaveProperty( '_id' )
    })

    test('call to generateIdsIfNeeded twice with same object will return the same result', () => {
        expect(generateIdsIfNeeded(ctx.obj)).toEqual(generateIdsIfNeeded(ctx.obj))
    })

    test('call to generateIdsIfNeeded twice with different objects will return different id', () => {
        expect(generateIdsIfNeeded(ctx.obj)._id).not.toEqual(generateIdsIfNeeded(ctx.anotherObj)._id)
    })

    const ctx = {
        obj: Uninitialized,
        anotherObj: Uninitialized,
        property: Uninitialized,
        anotherProperty: Uninitialized,
        veloDate: Uninitialized,
    }

    beforeEach(() => {
        ctx.obj = gen.randomObject()
        ctx.anotherObj = gen.randomObject()
        ctx.property = chance.word()
        ctx.anotherProperty = chance.word()
        ctx.veloDate = gen.veloDate()
    })
})
