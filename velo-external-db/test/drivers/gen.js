const chance = new require('chance')();

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

    for (const column of _columns) {
        entity[column] = chance.word()
    }
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

module.exports = { randomEntities, randomEntity, randomFilter, veloDate, randomObject, randomDbEntity, randomDbEntities }
