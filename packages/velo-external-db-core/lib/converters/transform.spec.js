const rewire = require('rewire')
const transform = rewire('./transform')
const { asWixData, unpackDates, generateIdsIfNeeded, prepareForInsert, defaultValueFor, isDate, prepareForUpdate, createProjectionArr } = transform
const { Uninitialized, gen } = require('test-commons')
const Chance = require('chance')
const chance = Chance()
const validate = require('uuid-validate')
const dateTimeProvider = require('../../test/drivers/date_time_provider_test_support')
const { SystemFields } = require('velo-external-db-commons')

describe('Converters', () => {
    test('unpack dates will duplicate object and do nothing is date is not there', async() => {
        expect(unpackDates(ctx.obj)).toEqual(ctx.obj)
    })

    test('pack dates will duplicate object and do nothing is date is not there', async() => {
        expect(asWixData(ctx.obj)).toMatchObject(ctx.obj)
    })

    test('unpack dates will take all properties with velo date structure and convert them to new Date', async() => {
        const objWithVeloDates = { ...ctx.obj, [ctx.property]: ctx.veloDate, [ctx.anotherProperty]: ctx.veloDate }

        expect(unpackDates(objWithVeloDates)).toEqual( { ...ctx.obj, [ctx.property]: new Date(ctx.veloDate.$date), [ctx.anotherProperty]: new Date(ctx.veloDate.$date) } )
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

    test('if item has all fields like in schema fields, item should stay the same', async() => {
        expect(prepareForInsert(ctx.obj, ctx.objSchemaFields)).toEqual( ctx.obj )
    })

    test('if item contain properties that does not exists in the schema, remove it', async() => {
        expect(prepareForInsert({ ...ctx.obj, [ctx.property]: chance.word() }, ctx.objSchemaFields)).toEqual( ctx.obj )
    })

    test('if item does not contain properties that exists in the schema, add default value for them', async() => {
        expect(prepareForInsert({ }, [{ field: ctx.property, type: 'text' }] )).toEqual({ [ctx.property]: '' } )
    })

    test('default value for non primary key text field is empty string', async() => {
        expect(defaultValueFor( { type: 'text' } )).toEqual( '' )
        expect(defaultValueFor( { type: 'text', isPrimary: false } )).toEqual( '' )
    })

    test('default value for primary key text field is a random uuid v4', async() => {
        expect(validate(defaultValueFor( { type: 'text', isPrimary: true } ), 4)).toBeTruthy()
    })

    test('default value boolean field is false', async() => {
        expect(defaultValueFor( { type: 'boolean' } )).toBeFalsy()
    })

    test('default value number int field 0', async() => {
        expect(defaultValueFor( { type: 'number', subtype: 'int' } )).toEqual(0)
        expect(defaultValueFor( { type: 'number', subtype: 'bigint' } )).toEqual(0)
    })

    test('default value number float field 0.0', async() => {
        expect(defaultValueFor( { type: 'number', subtype: 'float' } )).toEqual(0.0)
        expect(defaultValueFor( { type: 'number', subtype: 'double' } )).toEqual(0.0)
        expect(defaultValueFor( { type: 'number', subtype: 'decimal' } )).toEqual(0.0)
    })

    test('check date', async() => {
        expect(isDate( new Date() )).toBeTruthy()
        expect(isDate( '' )).toBeFalsy()
        expect(isDate( (new Date()).toISOString() ) ).toBeTruthy()
    })

    test('default value datetime field is current datetime', async() => {
        transform.__set__('dateTimeProvider', dateTimeProvider)

        expect(defaultValueFor( { type: 'datetime' } )).toEqual(dateTimeProvider.currentDateTime())
    })

    test('prepare for update will remove non existing fields', async() => {
        expect(prepareForUpdate({ ...ctx.obj, someProp: 'whatever' }, ctx.objSchemaFields)).toEqual( ctx.obj )
    })

    describe ('createProjectionArr', () => {
        test('will remove nonexistent fields from projection', () => {
            expect(createProjectionArr(ctx.defaultFields, ['_id', 'wrong'])).toEqual(['_id'])
        }) 

        test('will return array with all of the fields when receive invalid projection', async() => {
            const defaultFieldsArray = ctx.defaultFields.map(f => f.field)
            
            expect(createProjectionArr(ctx.defaultFields, ['wrong'])).toEqual(defaultFieldsArray) 
            expect(createProjectionArr(ctx.defaultFields, [])).toEqual(defaultFieldsArray) 
            expect(createProjectionArr(ctx.defaultFields)).toEqual(defaultFieldsArray) 
            expect(createProjectionArr(ctx.defaultFields, 5)).toEqual(defaultFieldsArray)  
        }) 

    })

    const ctx = {
        obj: Uninitialized,
        anotherObj: Uninitialized,
        objSchemaFields: Uninitialized,
        property: Uninitialized,
        anotherProperty: Uninitialized,
        veloDate: Uninitialized,
        defaultFields: Uninitialized
    }

    beforeEach(() => {
        ctx.obj = gen.randomObject()
        ctx.anotherObj = gen.randomObject()
        ctx.objSchemaFields = Object.keys(ctx.obj).map(f => ({ field: f, type: 'text' }), { })
        ctx.property = chance.word()
        ctx.anotherProperty = chance.word()
        ctx.veloDate = gen.veloDate()
        
        ctx.defaultFields = SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) )
    })
})
