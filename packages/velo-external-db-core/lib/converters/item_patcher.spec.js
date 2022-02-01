const rewire = require('rewire')
const validate = require('uuid-validate')
const { Uninitialized, gen } = require('test-commons')
const Chance = require('chance')
const chance = Chance()
const rewiredItemPatcher = rewire('./item_patcher')
const dateTimeProvider = require('../../test/drivers/date_time_provider_test_support')

describe('Item Patcher', () => {
    describe('default value for', () => {
        test('default value for non primary key text field is empty string', async() => {
            expect(env.itemPatcher.defaultValueFor( { type: 'text' } )).toEqual( '' )
            expect(env.itemPatcher.defaultValueFor( { type: 'text', isPrimary: false } )).toEqual( '' )
        })
        
        test('default value for primary key text field is a random uuid v4', async() => {
            expect(validate(env.itemPatcher.defaultValueFor( { type: 'text', isPrimary: true } ), 4)).toBeTruthy()
        })
        
        test('default value boolean field is false', async() => {
            expect(env.itemPatcher.defaultValueFor( { type: 'boolean' } )).toBeFalsy()
        })
        
        test('default value number int field 0', async() => {
            expect(env.itemPatcher.defaultValueFor( { type: 'number', subtype: 'int' } )).toEqual(0)
            expect(env.itemPatcher.defaultValueFor( { type: 'number', subtype: 'bigint' } )).toEqual(0)
        })
        
        test('default value number float field 0.0', async() => {
            expect(env.itemPatcher.defaultValueFor( { type: 'number', subtype: 'float' } )).toEqual(0.0)
            expect(env.itemPatcher.defaultValueFor( { type: 'number', subtype: 'double' } )).toEqual(0.0)
            expect(env.itemPatcher.defaultValueFor( { type: 'number', subtype: 'decimal' } )).toEqual(0.0)
        })
        
        test('default value datetime field is current datetime', async() => {
            env.itemPatcherClass.__set__('dateTimeProvider', dateTimeProvider)
            env.itemPatcher = new env.itemPatcherClass()
        
            expect(env.itemPatcher.defaultValueFor( { type: 'datetime' } )).toEqual(dateTimeProvider.currentDateTime())
        })
    })
    
    describe('prepare for insert', () => {
        test('if item has all fields like in schema fields, item should stay the same', async() => {
            expect(env.itemPatcher.prepareForInsert(ctx.obj, ctx.objSchemaFields)).toEqual( ctx.obj )
        })
        
        test('if item contain properties that does not exists in the schema, remove it', async() => {
            expect(env.itemPatcher.prepareForInsert({ ...ctx.obj, [ctx.property]: chance.word() }, ctx.objSchemaFields)).toEqual( ctx.obj )
        })
        
        test('if item does not contain properties that exists in the schema, add default value for them', async() => {
            expect(env.itemPatcher.prepareForInsert({ }, [{ field: ctx.property, type: 'text' }] )).toEqual({ [ctx.property]: '' } )
        })

        test('prepare for insert will unpack velo date', () => {
            const objWithVeloDate = { ...ctx.obj, [ctx.property]: ctx.veloDate }
            expect(env.itemPatcher.prepareForInsert(objWithVeloDate, [...ctx.objSchemaFields, { field: ctx.property, type: 'date' }])).toEqual(  { ...ctx.obj, [ctx.property]: new Date(ctx.veloDate.$date) } )
        })
    })
    
    describe('prepare for update', () => {
        test('prepare for update will remove non existing fields', async() => {
            expect(env.itemPatcher.prepareForUpdate({ ...ctx.obj, someProp: 'whatever' }, ctx.objSchemaFields)).toEqual( ctx.obj )
        })

        test('prepare for insert will unpack velo date', () => {
            const objWithVeloDate = { ...ctx.obj, [ctx.property]: ctx.veloDate }
            expect(env.itemPatcher.prepareForUpdate(objWithVeloDate, [...ctx.objSchemaFields, { field: ctx.property, type: 'date' }])).toEqual(  { ...ctx.obj, [ctx.property]: new Date(ctx.veloDate.$date) } )
        })
    })
    
    describe('unpack dates', () => {
        test('unpack dates will duplicate object and do nothing is date is not there', async() => {
            expect(env.itemPatcher.unpackDates(ctx.obj)).toEqual(ctx.obj)
        })

        test('unpack dates will take all properties with velo date structure and convert them to new Date', async() => {
            const objWithVeloDates = { ...ctx.obj, [ctx.property]: ctx.veloDate, [ctx.anotherProperty]: ctx.veloDate }
    
            expect(env.itemPatcher.unpackDates(objWithVeloDates)).toEqual( { ...ctx.obj, [ctx.property]: new Date(ctx.veloDate.$date), [ctx.anotherProperty]: new Date(ctx.veloDate.$date) } )
        })
    })

    const env = {
        itemPatcher: Uninitialized,
        itemPatcherClass: Uninitialized
    }

    const ctx = {
        obj: Uninitialized,
        objSchemaFields: Uninitialized,
        property: Uninitialized,
        veloDate: Uninitialized
    }

    beforeEach(() => {
        ctx.obj = gen.randomObject()
        ctx.objSchemaFields = Object.keys(ctx.obj).map(f => ({ field: f, type: 'text' }), { })
        ctx.property = chance.word()
        ctx.veloDate = gen.veloDate()

        env.itemPatcherClass = rewiredItemPatcher.__get__('ItemPatcher')
        env.itemPatcher = new env.itemPatcherClass()
    })
})