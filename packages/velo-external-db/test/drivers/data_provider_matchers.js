const entitiesWithOwnerFieldOnly = (entities) => expect.arrayContaining(entities.map(e => ({ _owner: e._owner })))


const toggleCase = (str) => str.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('')

module.exports = { entitiesWithOwnerFieldOnly, toggleCase }

