const Chance = require('chance')
const { AdapterOperators } = require('velo-external-db-commons')

const chance = Chance()

const invalidOperatorForType = (validOperators) => randomObjectFromArray (
    Object.values(AdapterOperators).filter(x => !validOperators.includes(x))
)

const randomObjectFromArray = (array) => array[chance.integer({ min: 0, max: array.length - 1 })]

const randomColumn = () => ( { name: chance.word(), type: 'text', subtype: 'string', precision: '256', isPrimary: false } )


const randomWixType = () => randomObjectFromArray(['number', 'text', 'boolean', 'url', 'datetime', 'object'])

const randomOperator = () => (chance.pickone(['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq', '$contains', '$startsWith', '$endsWith']))

const randomFilter = () => {
    const op = randomOperator()
    const fieldName = chance.word()
    const value = op === '$hasSome' ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        [fieldName]: { [op]: value } 
    }
}

const randomArrayOf = (gen) => {
    const arr = []
    const num = chance.natural({ min: 2, max: 20 })
    for (let i = 0; i < num; i++) {
        arr.push(gen())
    }
    return arr
}

const randomCollectionName = () => chance.word({ length: 5 })

const randomCollections = () => randomArrayOf( randomCollectionName )

const randomWixDataType = () => chance.pickone(['number', 'text', 'boolean', 'url', 'datetime', 'image', 'object' ])

const randomDbField = () => ( { field: chance.word(), type: randomWixDataType(), subtype: chance.word(), isPrimary: chance.bool() } )

const randomDbFields = () => randomArrayOf( randomDbField )

const randomDb = () => ( { id: randomCollectionName(), fields: randomDbFields() })

const randomDbs = () => randomArrayOf( randomDb )

const randomDbsWithIdColumn = () => randomDbs().map(i => ({ ...i, fields: [ ...i.fields, { field: '_id', type: 'text' }] }))


module.exports = { randomOperator, randomFilter, randomWixType, invalidOperatorForType, randomObjectFromArray, randomColumn, randomDb, randomDbsWithIdColumn, randomCollections, randomDbs, randomCollectionName }