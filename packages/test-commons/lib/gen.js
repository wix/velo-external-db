const Chance = require('chance')
const { AllSchemaOperations } = require('velo-external-db-commons')
const { AdapterOperators } = require('../../velo-external-db-core/node_modules/velo-external-db-commons/lib')
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains } = AdapterOperators //TODO: extract

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

const randomDbEntities = (columns) => {
    const num = chance.natural({ min: 2, max: 20 })
    const arr = []
    for (let i = 0; i < num; i++) {
        arr.push(randomDbEntity(columns))
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
    const quantity = chance.natural({ min: 1, max: arr.length })
    return chance.pickset(arr, quantity)
}

const randomCollectionName = () => chance.word({ length: 5 })
const randomCollections = () => randomArrayOf( randomCollectionName )

const randomFieldName = () => chance.word({ length: 5 })

const randomDbField = () => ( { name: chance.word(), type: chance.word(), subtype: chance.word(), isPrimary: chance.bool() } )

const randomDbFields = () => randomArrayOf( randomDbField )

const fieldsArrayToFieldObj = fields => fields.reduce((pV, cV) => ({
        ...pV, ...{ [cV.name]: { 
        displayName: cV.name,
        type: cV.type,
        subtype: cV.subtype,
        isPrimary: cV.isPrimary
        } }
}), {})

const randomColumn = () => ( { name: chance.word(), type: 'text', subtype: 'string', precision: '256', isPrimary: false } )
const randomNumberColumns = () => {
    return [ { name: chance.word(), type: 'number', subtype: 'int', isPrimary: false },
             { name: chance.word(), type: 'number', subtype: 'decimal', precision: '10,2', isPrimary: false } ]
}

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

const randomDbEntity = (columns) => {
    const entity = {
        _id: chance.guid(),
        _createdDate: newDate(),
        _updatedDate: newDate(),
        _owner: chance.guid(),
    }

    const _columns = columns || []

    _columns.forEach(column => entity[column] = chance.word())

    return entity
}

const randomNumberDbEntity = (columns) => {
    const entity = {
        _id: chance.guid(),
        _createdDate: newDate(),
        _updatedDate: newDate(),
        _owner: chance.guid(),
    }

    const _columns = columns || []

    _columns.forEach(column => {
        if (column.type === 'number' && column.subtype === 'int') {
            entity[column.name] = chance.integer({ min: 0, max: 10000 })
        } else if (column.type === 'number' && column.subtype === 'decimal') {
            entity[column.name] = chance.floating({ min: 0, max: 10000, fixed: 2 })
        }
    })

    return entity
}


const randomFilter = () => {
    const op = randomOperator()
    const fieldName = chance.word()
    const value = op === '$hasSome' ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        [fieldName]: { [op]: value } 
    }
}

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

const idFilter = () => {
    const operator = randomAdapterOperator()
    const value = operator === '$hasSome' ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        fieldName: '_id',
        operator,
        value
    }
}

const randomOperator = () => (chance.pickone(['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq', '$contains', '$startsWith', '$endsWith']))

const randomAdapterOperator = () => ( chance.pickone([ne, lt, lte, gt, gte, include, eq, string_contains, string_begins, string_ends]) )

const veloDate = () => ( { $date: newDate().toISOString() } )

const randomDb = () => ( { id: randomCollectionName(),
                           fields: randomDbFields() })

const randomDbs = () => randomArrayOf( randomDb )

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

const randomSchemaOperation = () => (chance.pickone(AllSchemaOperations))

const randomSchemaOperations = () => randomElementsFromArray(AllSchemaOperations)

module.exports = { randomEntities, randomEntity, randomFilter, idFilter, veloDate, randomObject, randomDbs,
                   randomDbEntity, randomDbEntities, randomColumn, randomCollectionName, randomNumberDbEntity, randomObjectFromArray,
                   randomCollections, randomNumberColumns, randomKeyObject, deleteRandomKeyObject, clearRandomKeyObject, randomConfig,
                   fieldsArrayToFieldObj, randomFieldName, randomOperator, randomAdapterOperator, randomWrappedFilter,
                   randomSchemaOperation, randomSchemaOperations }


