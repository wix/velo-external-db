import { Item, ResponseField } from '@wix-velo/velo-external-db-types'

export const entitiesWithOwnerFieldOnly = (entities: Item[]) => expect.arrayContaining(entities.map((e: Item) => ({ _owner: e._owner })))

export const entityWithObjectField = (entity: Item, entityFields: ResponseField[]) => {
    const { field: objectFieldName } =  entityFields.find((f: { type: string }) => f.type === 'object')
    const stringifyObjectField = JSON.stringify(entity[objectFieldName])

    return expect.arrayContaining([
        expect.objectContaining({
            ...entity,
             [objectFieldName]: expect.toBeOneOf([entity[objectFieldName], expect.toEqualIgnoringWhitespace(stringifyObjectField)])
        })
    ])
}
