const Chance = require('chance')
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

const randomCollectionName = () => chance.word({ length: 5 })
const randomDbField = () => ( { name: chance.word(), type: chance.word(), isPrimary: chance.bool() } )
const randomDbFields = () => randomArrayOf( randomDbField )

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
            if (entity[column.name] - parseInt(entity[column.name]) === 0 )  
                entity[column.name] + 0.01    // todo - fix this by check if spanner and then insert as Spanner.float()
        }
    })

    return entity
}

const randomFilter = () => {
    const op = randomOperator()
    return {
        // kind: 'filter',
        operator: op,
        fieldName: chance.word(),
        value: op === '$hasSome' ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    }
}

const randomV2Filter = () => {
    const op = randomOperator()
    const fieldName = chance.word()
    const value = op === '$hasSome' ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        [fieldName]: { [op]: value } 
    }
}

const idFilter = () => {
    const op = randomOperator()
    return {
        operator: randomOperator(),
        fieldName: '_id',
        value: op === '$hasSome' ? [chance.guid(), chance.guid(), chance.guid(), chance.guid(), chance.guid()] : chance.guid()
    }
}

const idV2Filter = () => {
    const op = randomOperator()
    const value = op === '$hasSome' ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        _id: { [op]: value }
    }
}

const randomOperator = () => (chance.pickone(['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq', '$contains', '$startsWith', '$endsWith']))

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

module.exports = { randomDbs, randomEntities, randomEntity, randomFilter, idFilter, veloDate, randomObject,
     randomDbEntity, randomDbEntities, randomColumn, randomCollectionName, randomNumberDbEntity, randomObjectFromArray,
      randomNumberColumns, randomKeyObject, deleteRandomKeyObject, clearRandomKeyObject, randomConfig, randomV2Filter, idV2Filter }


