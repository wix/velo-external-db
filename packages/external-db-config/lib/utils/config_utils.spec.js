const Chance = require('chance')
const chance = Chance();
const { checkRequiredKeys } = require('../utils/config_utils')
const { Uninitialized, gen } = require('test-commons')


describe('Check Required Keys Function', () => {
    
    beforeEach(() => {
        ctx.randomObject = gen.randomObject()
        ctx.requiredKeys = Array.from({length: 6}, () => chance.word())
    });

    test('checkRequiredKeys will validate object with zero required keys', () => {
        const missingKeys = checkRequiredKeys(ctx.randomObject, [])
        
        expect(missingKeys).toEqual([])
    })

    test('checkRequiredKeys will validate object with missing required keys', () => {
        const missingKeys = checkRequiredKeys(ctx.randomObject, ctx.requiredKeys)
        
        expect(missingKeys).toEqual(ctx.requiredKeys)
    })

    test('checkRequiredKeys will validate empty object', () => {
        const missingKeys = checkRequiredKeys({}, ctx.requiredKeys)
        
        expect(missingKeys).toEqual(ctx.requiredKeys)
    })

    test('checkRequiredKeys will validate object with random cleared key', () => {
        const objectKeys = Object.keys(ctx.randomObject)
        const { clearedKey, newObject:brokenObject } = gen.clearRandomKeyObject(ctx.randomObject)

        const missingKeys = checkRequiredKeys(brokenObject, objectKeys)
        
        expect(missingKeys).toEqual([clearedKey])
    })

    test('checkRequiredKeys will validate object with random deleted key', () => {
        const objectKeys = Object.keys(ctx.randomObject)
        const { deletedKey, newObject:brokenObject } = gen.deleteRandomKeyObject(ctx.randomObject)

        const missingKeys = checkRequiredKeys(brokenObject, objectKeys)
        
        expect(missingKeys).toEqual([deletedKey])
    })

    test('checkRequiredKeys will validate object with deleted key and cleared key', () => {
        const objectKeys = Object.keys(ctx.randomObject)
        const { clearedKey, newObject:clearedObject } = gen.clearRandomKeyObject(ctx.randomObject)
        const { deletedKey, newObject:brokenObject } = gen.deleteRandomKeyObject(clearedObject)

        const missingKeys = checkRequiredKeys(brokenObject, objectKeys)
        
        expect(missingKeys).toEqual(expect.arrayContaining([clearedKey,deletedKey]))
    })


    const ctx = {
        randomObject: Uninitialized,
        requiredKeys: Uninitialized,
    };

    
    
})