const { asWixData, unpackDates, generateIdsIfNeeded } = require('./transform')
const { Uninitialized, gen } = require('test-commons')
const Chance = require('chance')
const chance = Chance();

describe('Converters', () => {
    test('unpack dates will duplicate object and do nothing is date is not there', async () => {
        expect(unpackDates(ctx.obj)).toEqual(ctx.obj)
    })

    test('pack dates will duplicate object and do nothing is date is not there', async () => {
        expect(asWixData(ctx.obj)).toEqual(ctx.obj)
    })

    test('unpack dates will take all properties with velo date structure and convert them to new Date', async () => {
        const objWithVeloDates = { ...ctx.obj, [ctx.property]: ctx.veloDate, [ctx.anotherProperty]: ctx.veloDate }

        expect(unpackDates(objWithVeloDates)).toEqual( { ...ctx.obj, [ctx.property]: new Date(ctx.veloDate.$date), [ctx.anotherProperty]: new Date(ctx.veloDate.$date)} )
    })

    test('pack dates will take all properties with date and convert them to velo date', async () => {
        const objWithJsDates = { ...ctx.obj, [ctx.property]: new Date(ctx.veloDate.$date), [ctx.anotherProperty]: new Date(ctx.veloDate.$date)}

        expect(asWixData(objWithJsDates)).toEqual( { ...ctx.obj, [ctx.property]: ctx.veloDate, [ctx.anotherProperty]: ctx.veloDate} )
    })

    test('if _id field exists do nothing', async () => {
        expect(generateIdsIfNeeded({ ...ctx.obj, _id: 'something'})).toEqual( { ...ctx.obj, _id: 'something'} )
    })

    test('if _id field does not exist generate id', async () => {
        expect(generateIdsIfNeeded({ ...ctx.obj })).toHaveProperty( '_id' )
    })

    const ctx = {
        obj: Uninitialized,
        property: Uninitialized,
        anotherProperty: Uninitialized,
        veloDate: Uninitialized,
    };

    beforeEach(() => {
        ctx.obj = gen.randomObject();
        ctx.property = chance.word();
        ctx.anotherProperty = chance.word();
        ctx.veloDate = gen.veloDate();
    });
})
