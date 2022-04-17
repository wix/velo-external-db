
const { SystemFields } = require('velo-external-db-commons')
const Chance = require('chance')


const chance = Chance()

const newDate = () => {
    const d = new Date()
    d.setMilliseconds(0)
    return d
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



const randomDbEntities = (columns) => {
    const num = chance.natural({ min: 2, max: 20 })
    const arr = []
    for (let i = 0; i < num; i++) {
        arr.push(randomDbEntity(columns))
    }
    return arr
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

const randomObjectDbEntity = (columns) => {
    const entity = {
        _id: chance.guid(),
        _createdDate: newDate(),
        _updatedDate: newDate(),
        _owner: chance.guid(),
    }

    const _columns = columns || []

    _columns.forEach(column => entity[column.name] = ({ [chance.word()]: chance.word() }) )

    return entity
}

const randomNumberColumns = () => {
    return [ { name: chance.word(), type: 'number', subtype: 'int', isPrimary: false },
             { name: chance.word(), type: 'number', subtype: 'decimal', precision: '10,2', isPrimary: false } ]
}

const randomColumn = () => ( { name: chance.word(), type: 'text', subtype: 'string', precision: '256', isPrimary: false } )

const randomObjectColumn = () => ( { name: chance.word(), type: 'object' } )

const randomCollectionName = () => chance.word({ length: 5 })

const systemFieldsWith = fields => {
    const systemFields = SystemFields.map(({ name, type, subtype, isPrimary }) => ({ field: name, type, subtype, isPrimary }))
    return fields.reduce((pV, cV) =>
        [...pV, 
        {
            field: cV.name,
            type: cV.type,
            subtype: cV.subtype,
            isPrimary: cV.isPrimary
        }]
        , systemFields)
}


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

const randomMatchesValueWithDashes = () => {
    const num = chance.natural({ min: 2, max: 5 })
    const arr = []
    for (let i = 0; i < num; i++) {
        arr.push(chance.word())
    }
    return arr.join('-')
}

module.exports = {
    randomDbEntities, randomDbEntity, randomNumberDbEntity, randomNumberColumns, randomColumn, randomCollectionName,
    systemFieldsWith, deleteRandomKeyObject, randomMatchesValueWithDashes, randomObjectColumn, randomObjectDbEntity
}
