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

module.exports = { randomEntities, randomEntity }
