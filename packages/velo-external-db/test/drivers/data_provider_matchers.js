const entitiesWithOwnerFieldOnly = (entities) => expect.arrayContaining(entities.map(e => ({ _owner: e._owner })))

module.exports = { entitiesWithOwnerFieldOnly }

