const Chance = require('chance')
const {  AdapterOperators } = require('velo-external-db-commons')
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains } = AdapterOperators 

const chance = Chance()

const randomObject = () => {
    const obj = {}
    const num = chance.natural({ min: 2, max: 20 })
    for (let i = 0; i < num; i++) {
        Object.assign(obj, { [chance.word()]: chance.sentence() })
    }
    return obj
}

const randomEntities = (columns) => {
    const num = chance.natural({ min: 2, max: 20 })
    const arr = []
    for (let i = 0; i < num; i++) {
        arr.push(randomEntity(columns))
    }
    return arr
}

const newDate = () => {
    const d = new Date()
    d.setMilliseconds(0)
    return d
}

const randomArrayOf = (gen) => {
    const arr = []
    const num = chance.natural({ min: 2, max: 20 })
    for (let i = 0; i < num; i++) {
        arr.push(gen())
    }
    return arr
}

const randomElementsFromArray = (arr) => {
    const quantity = chance.natural({ min: 1, max: arr.length-1 })
    return chance.pickset(arr, quantity)
}

const randomCollectionName = () => chance.word({ length: 5 })
const randomCollections = () => randomArrayOf( randomCollectionName )

const randomFieldName = () => chance.word({ length: 5 })


const randomEntity = (columns) => {
    const entity = {
        _id: chance.guid(),
        _createdDate: veloDate(),
        _updatedDate: veloDate(),
        _owner: chance.guid(),
    }

    const _columns = columns || []

    for (const column of _columns) {
        entity[column] = chance.word()
    }
    return entity
}

const veloDate = () => ( { $date: newDate().toISOString() } )

const randomObjectFromArray = (array) => array[chance.integer({ min: 0, max: array.length - 1 })]

const randomKeyObject = (obj) => {
    const objectKeys = Object.keys(obj)
    const selectedKey = objectKeys[Math.floor(Math.random() * objectKeys.length)]
    return selectedKey
}

const deleteRandomKeyObject = (obj) => {
    const deletedKey = randomKeyObject(obj)
    delete obj[deletedKey]
    return { deletedKey, newObject: obj }
}

const clearRandomKeyObject = (obj) => {
    const newObject = { ...obj }
    const clearedKey = randomKeyObject(newObject)
    newObject[clearedKey] = ''
    return { clearedKey, newObject }
}


const randomConfig = () => ({
    host: chance.url(),
    user: chance.first(),
    password: chance.guid(),
    secretKey: chance.guid(),
    db: chance.word(),
})

const randomAdapterOperator = () => ( chance.pickone([ne, lt, lte, gt, gte, include, eq, string_contains, string_begins, string_ends]) )

const randomWrappedFilter = () => {
    const operator = randomAdapterOperator()
    const fieldName = chance.word()
    const value = operator === AdapterOperators.include ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        fieldName,
        operator,
        value
    }
}

module.exports = { randomEntities, randomEntity, veloDate, randomObject, 
                   randomCollectionName, randomObjectFromArray,
                   randomCollections, randomKeyObject, deleteRandomKeyObject, clearRandomKeyObject, randomConfig,
                   randomFieldName, randomAdapterOperator, randomWrappedFilter,
                   randomArrayOf,
                   randomElementsFromArray }


