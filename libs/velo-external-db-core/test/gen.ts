import * as Chance from 'chance'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { gen as genCommon } from '@wix-velo/test-commons'

const chance = Chance()

export const invalidOperatorForType = (validOperators: string | string[]) => randomObjectFromArray (
    Object.values(AdapterOperators).filter(x => !validOperators.includes(x))
)

export const randomObjectFromArray = (array: any[]) => array[chance.integer({ min: 0, max: array.length - 1 })]

export const randomColumn = () => ( { name: chance.word(), type: 'text', subtype: 'string', precision: '256', isPrimary: false } )


export const randomWixType = () => randomObjectFromArray(['number', 'text', 'boolean', 'url', 'datetime', 'object'])

export const randomOperator = () => (chance.pickone(['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq', '$contains', '$startsWith', '$endsWith']))

export const randomFilter = () => {
    const op = randomOperator()
    const fieldName = chance.word()
    const value = op === '$hasSome' ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        [fieldName]: { [op]: value } 
    }
}

export const randomArrayOf = (gen: any) => {
    const arr = []
    const num = chance.natural({ min: 2, max: 20 })
    for (let i = 0; i < num; i++) {
        arr.push(gen())
    }
    return arr
}

export const randomCollectionName = () => chance.word({ length: 5 })

export const randomCollections = () => randomArrayOf( randomCollectionName )

export const randomWixDataType = () => chance.pickone(['number', 'text', 'boolean', 'url', 'datetime', 'image', 'object' ])

export const randomDbField = () => ( { field: chance.word(), type: randomWixDataType(), subtype: chance.word(), isPrimary: chance.bool() } )

export const randomDbFields = () => randomArrayOf( randomDbField )

export const randomDb = () => ( { id: randomCollectionName(), fields: randomDbFields() })

export const randomDbs = () => randomArrayOf( randomDb )

export const randomDbsWithIdColumn = () => randomDbs().map(i => ({ ...i, fields: [ ...i.fields, { field: '_id', type: 'text' }] }))

export const truthyValue = () => chance.pickone(['true', '1', 1, true])
export const falsyValue = () => chance.pickone(['false', '0', 0, false])

export const randomKeyObject = (obj: {}) => {
    const objectKeys = Object.keys(obj)
    const selectedKey = objectKeys[Math.floor(Math.random() * objectKeys.length)]
    return selectedKey
}

export const deleteRandomKeyObject = (obj: { [x: string]: any }) => {
    const deletedKey = randomKeyObject(obj)
    delete obj[deletedKey]
    return { deletedKey, newObject: obj }
}

export const randomBodyWith = (obj: any) => ({
    ...genCommon.randomObject(),
    ...obj
})
