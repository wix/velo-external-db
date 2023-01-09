const Chance = require('chance')
const chance = Chance()


const newDate = () => {
    const d = new Date()
    d.setMilliseconds(0)
    return d
}

const veloDate = () => ( { $date: newDate().toISOString() } )

const randomEntity = (columns) => {
    const entity = {
        _id: chance.guid(),
        _createdDate: veloDate(),
        _updatedDate: veloDate(),
        _owner: chance.guid(),
    }

    const _columns = columns || []

    for (const column of _columns) {
        entity[column.name] = chance.word({length: 10000})
    }
    return entity
}

module.exports = { randomEntity }
