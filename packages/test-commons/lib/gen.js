const Chance = require('chance')
const chance = Chance();

const randomObject = () => {
    const obj = {};
    const num = chance.natural({min: 2, max: 20});
    for (let i = 0; i < num; i++) {
        Object.assign(obj, {[chance.word()]: chance.sentence()});
    }
    return obj;
};

const randomEntities = (columns) => {
    const num = chance.natural({min: 2, max: 20});
    const arr = [];
    for (let i = 0; i < num; i++) {
        arr.push(randomEntity(columns))
    }
    return arr;
}

const randomDbEntities = (columns) => {
    const num = chance.natural({min: 2, max: 20});
    const arr = [];
    for (let i = 0; i < num; i++) {
        arr.push(randomDbEntity(columns))
    }
    return arr;
}

const newDate = () => {
    const d = new Date()
    d.setMilliseconds(0)
    return d;
}

const randomArrayOf = (gen) => {
    const arr = [];
    const num = chance.natural({min: 2, max: 20});
    for (let i = 0; i < num; i++) {
        arr.push(gen())
    }
    return arr;
}

const randomCollectionName = () => chance.word({ length: 5 })
const randomDbField = () => ( {name: chance.word(), type: chance.word(), isPrimary: chance.bool()} )
const randomDbFields = () => randomArrayOf( randomDbField )

const randomColumn = () => ( {name: chance.word(), type: 'text', subtype: 'string', precision: '256', isPrimary: false} )
const randomNumberColumns = () => {
    return [ {name: chance.word(), type: 'number', subtype: 'int', isPrimary: false},
             {name: chance.word(), type: 'number', subtype: 'decimal', precision: '10,2', isPrimary: false} ]
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
    return entity;
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

    return entity;
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

    return entity;
}



const randomFilter = () => {
    const op = chance.pickone(['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq', '$contains', '$startsWith', '$endsWith'])
    return {
        // kind: 'filter',
        operator: op,
        fieldName: chance.word(),
        value: op === '$hasSome' ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    }
}

const veloDate = () => ( { $date: newDate().toISOString() } )

const randomDb = () => ( { id: randomCollectionName(),
                           fields: randomDbFields() })

const randomDbs = () => randomArrayOf( randomDb )

const randomKeyObject = (obj) => {
    objectKeys = Object.keys(obj)
    selectedKey = objectKeys[Math.floor(Math.random() * objectKeys.length)]
    return selectedKey
}

const deleteRandomKeyObject = (obj) => {
    const deletedKey = randomKeyObject(obj)
    delete obj[deletedKey]
    return { deletedKey, newObject:obj }
}

const clearRandomKeyObject = (obj) => {
    const newObject = {...obj}
    const clearedKey = randomKeyObject(newObject);
    newObject[clearedKey] = '';
    return { clearedKey, newObject };
}

const randomSecret = () => {
    const secret = {
        HOST: chance.url(),
        USER: chance.first(),
        PASSWORD: chance.guid(),
        SECRET_KEY: chance.guid(),
        DB: chance.word(),
    }
    return secret
}

module.exports = { randomDbs, randomEntities, randomEntity, randomFilter, veloDate, randomObject,
     randomDbEntity, randomDbEntities, randomColumn, randomCollectionName, randomNumberDbEntity,
      randomNumberColumns, randomKeyObject, deleteRandomKeyObject, clearRandomKeyObject, randomSecret }
