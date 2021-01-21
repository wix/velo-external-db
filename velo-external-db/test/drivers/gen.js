const chance = new require('chance')();

const randomObject = () => {
    const obj = {};
    const num = chance.natural({min: 2, max: 20});
    for (let i = 0; i < num; i++) {
        Object.assign(obj, {[chance.word()]: chance.sentence()});
    }
    return obj;
};

const randomEntities = () => {
    const num = chance.natural({min: 2, max: 20});
    const arr = [];
    for (let i = 0; i < num; i++) {
        arr.push(randomObject())
    }
    return arr;
}

module.exports = { randomEntities }
