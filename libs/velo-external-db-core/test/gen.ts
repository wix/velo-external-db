import * as Chance from 'chance'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { gen as genCommon } from '@wix-velo/test-commons'
import { DomainIndex, DomainIndexStatus } from '@wix-velo/velo-external-db-types'
import { Index } from '../src/spi-model/indexing'
import { 
    CollectionCapabilities,
    CollectionOperation,
    InputField,
    FieldType,
    ResponseField,
    DataOperation,
    Table,
    Encryption,
    PagingMode,
 } from '@wix-velo/velo-external-db-types'

 const { eq, ne, string_contains, string_begins, string_ends, gt, gte, lt, lte, include } = AdapterOperators

const chance = Chance()

export const invalidOperatorForType = (validOperators: string | string[]) => randomObjectFromArray (
    Object.values(AdapterOperators).filter(x => !validOperators.includes(x))
)

export const randomObjectFromArray = <T>(array: any[]): T => array[chance.integer({ min: 0, max: array.length - 1 })]

export const randomColumn = (): InputField => ( { name: chance.word(), type: 'text', subtype: 'string', precision: '256', isPrimary: false } )

// TODO: random the wix-type filed from the enum 
export const randomWixType = () => randomObjectFromArray(['number', 'text', 'boolean', 'url', 'datetime', 'object'])

export const randomFieldType = () => randomObjectFromArray<FieldType>(Object.values(FieldType))

export const randomCollectionOperation = () => randomObjectFromArray<CollectionOperation>(Object.values(CollectionOperation))

export const randomOperator = () => (chance.pickone(['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq', '$contains', '$startsWith', '$endsWith']))

export const randomFilter = () => {
    const op = randomOperator()
    const fieldName = chance.word()
    const value = op === '$hasSome' ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        [fieldName]: { [op]: value } 
    }
}

export const randomArrayOf= <T>(gen: any): T[] => {
    const arr = []
    const num = chance.natural({ min: 2, max: 20 })
    for (let i = 0; i < num; i++) {
        arr.push(gen())
    }
    return arr
}

export const randomAdapterOperators = () => (chance.pickone([eq, ne, string_contains, string_begins, string_ends, gt, gte, lt, lte, include]))

export const randomDataOperations = () => (chance.pickone(Object.values(DataOperation)))

export const randomColumnCapabilities = () => ({
    sortable: chance.bool(),
    columnQueryOperators: [ randomAdapterOperators() ] 
})

export const randomCollectionCapabilities = (): CollectionCapabilities => ({
    dataOperations: [ randomDataOperations() ],
    fieldTypes: [ randomFieldType() ],
    collectionOperations: [ randomCollectionOperation() ],
    indexing: [],
    encryption: Encryption.notSupported,
    referenceCapabilities: {
        supportedNamespaces: []
    },
    pagingMode: PagingMode.offset
})

export const randomCollectionName = ():string => chance.word({ length: 5 })

export const randomCollections = () => randomArrayOf<string>( randomCollectionName )

export const randomWixDataType = () => chance.pickone(['number', 'text', 'boolean', 'datetime', 'object' ])

export const randomDbField = (): ResponseField => ( { field: chance.word(), type: randomWixDataType(), subtype: chance.word(), isPrimary: chance.bool(), capabilities: randomColumnCapabilities() } )

export const randomDbFields = () => randomArrayOf<ResponseField>( randomDbField )

export const randomDb = (): Table => ( { id: randomCollectionName(), fields: randomDbFields(), capabilities: randomCollectionCapabilities() })

export const randomDbs = (): Table[] => randomArrayOf( randomDb )

export const randomDbsWithIdColumn = (): Table[] => randomDbs().map(i => ({ ...i, fields: [ ...i.fields, { field: '_id', type: 'text', capabilities: randomColumnCapabilities() }] }))

export const truthyValue = () => chance.pickone(['true', '1', 1, true])
export const falsyValue = () => chance.pickone(['false', '0', 0, false])

export const randomKeyObject = (obj: Record<string, unknown>) => {
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

export const randomDomainIndex = (): DomainIndex => ({
    name: chance.word(),
    columns: randomArrayOf(() => chance.word()),
    isUnique: chance.bool(),
    caseInsensitive: chance.bool(),
    order: chance.pickone(['ASC', 'DESC']),
    status: DomainIndexStatus.ACTIVE,
})


export const randomSpiIndex = (): Index => ({
    name: chance.word(),
    fields: randomArrayOf(() => ({
        name: chance.word(),
        order: chance.pickone(['ASC', 'DESC']),
    })),
    unique: chance.bool(),
    caseInsensitive: chance.bool(),
})
