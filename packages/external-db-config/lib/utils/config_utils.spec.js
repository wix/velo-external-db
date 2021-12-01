const Chance = require('chance')
const chance = Chance()
const { checkRequiredKeys } = require('../utils/config_utils')
const { gen } = require('test-commons')


describe('Check Required Keys Function', () => {
    test('validate object with zero required keys', () => {
        expect(checkRequiredKeys(gen.randomObject(), [])).toEqual([])
        expect(checkRequiredKeys({}, [])).toEqual([])
    })

    test('validate object with missing required keys', () => {
        expect(checkRequiredKeys({}, ['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
        expect(checkRequiredKeys(gen.randomObject(), ['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
    })

    test('consider prop non existent if property is null', () => {
        expect(checkRequiredKeys({ prop: null }, [ 'prop' ])).toEqual(['prop'])
    })

    test('consider prop non existent if property is undefined', () => {
        expect(checkRequiredKeys({ prop: undefined }, [ 'prop' ])).toEqual(['prop'])
    })

    test('consider prop non existent if property is empty string', () => {
        expect(checkRequiredKeys({ prop: '' }, [ 'prop' ])).toEqual(['prop'])
    })

    test('consider prop non existent if property is not string', () => {
        expect(checkRequiredKeys({ prop: {} }, [ 'prop' ])).toEqual(['prop'])
        expect(checkRequiredKeys({ prop: 5 }, [ 'prop' ])).toEqual(['prop'])
    })

    test('property detect non empty string prop', () => {
        expect(checkRequiredKeys({ prop: chance.word() }, ['prop'])).toEqual([])
    })
})