const { asWixData, unpackDates } = require('./transform')
const { Uninitialized } = require('../../test/commons/test-commons');
const gen = require('../../test/drivers/gen');
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
        const objWithVeloDates = Object.assign(ctx.obj, { [ctx.property]: ctx.veloDate, [ctx.anotherProperty]: ctx.veloDate});

        expect(unpackDates(objWithVeloDates)).toEqual(Object.assign(ctx.obj, { [ctx.property]: new Date(ctx.veloDate.$date), [ctx.anotherProperty]: new Date(ctx.veloDate.$date)}))
    })

    test('pack dates will take all properties with date and convert them to velo date', async () => {
        const objWithJsDates = Object.assign(ctx.obj, { [ctx.property]: new Date(ctx.veloDate.$date), [ctx.anotherProperty]: new Date(ctx.veloDate.$date)});

        expect(asWixData(objWithJsDates)).toEqual(Object.assign(ctx.obj, { [ctx.property]: ctx.veloDate, [ctx.anotherProperty]: ctx.veloDate}))
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
