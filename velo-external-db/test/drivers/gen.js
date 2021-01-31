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

const randomEntity = (columns) => {
    const d = new Date()
    d.setMilliseconds(0)

    const entity = {
        _id: chance.guid(),
        _createdDate: d,
        _updatedDate: d,
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

module.exports = { randomEntities, randomEntity, randomFilter }
