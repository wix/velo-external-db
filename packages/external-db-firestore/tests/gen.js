const Chance = require('chance')
const chance = Chance()
const { AdapterOperators } = require('@wix-velo/velo-external-db-commons')
const { eq, gt, gte, include, lt, lte, ne } = AdapterOperators


const randomSupportedFilter = () => {
    const operator = chance.pickone([ne, lt, lte, gt, gte, include, eq])
    const fieldName = chance.word()
    const value = operator === include ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        fieldName,
        operator,
        value
    }
}



module.exports = { randomSupportedFilter }