
const entitiesWithOwnerFieldOnly = (entities) => expect.arrayContaining(entities.map(e => ({ _owner: e._owner })))

const entityWithObjectField = (entity, entityFields) => {
    const { field: objectFieldName } =  entityFields.find(f => f.type === 'object')
    const stringifyObjectField = JSON.stringify(entity[objectFieldName])

    return expect.arrayContaining([
        expect.objectContaining({
            ...entity,
             [objectFieldName]: expect.toBeOneOf([entity[objectFieldName], expect.toEqualIgnoringWhitespace(stringifyObjectField)])
        })
    ])
}

module.exports = { entitiesWithOwnerFieldOnly, entityWithObjectField }
