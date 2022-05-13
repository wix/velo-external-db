

const Chance = require('chance')

const {  AdapterOperators } = require('velo-external-db-commons')
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains } = AdapterOperators 

const chance = Chance()


const randomAdapterOperator = () => ( chance.pickone([ne, lt, lte, gt, gte, include, eq, string_contains, string_begins, string_ends]) )


const idFilter = () => {
    const operator = randomAdapterOperator()
    const value = operator === '$hasSome' ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        fieldName: '_id',
        operator,
        value
    }
}

module.exports = { idFilter }
