
import { SystemFields } from '@wix-velo/velo-external-db-commons'
import { collectionSpi, schemaUtils, indexSpi } from '@wix-velo/velo-external-db-core'
import { 
    InputField,
 } from '@wix-velo/velo-external-db-types'
import { DomainIndex, DomainIndexStatus } from '@wix-velo/velo-external-db-types'
import * as Chance from 'chance'
const { IndexFieldOrder } = indexSpi

const chance = Chance()

const newDate = () => {
    const d = new Date()
    d.setMilliseconds(0)
    return d
}

export const randomDbEntity = (columns: string[]) => {
    const entity = {
        _id: chance.guid(),
        _createdDate: newDate(),
        _updatedDate: newDate(),
        _owner: chance.guid(),
    }

    const _columns = columns || []

    _columns.forEach((column: string) => entity[column] = chance.word())

    return entity
}

export const randomArrayOf= <T>(gen: any): T[] => {
    const arr = []
    const num = chance.natural({ min: 2, max: 20 })
    for (let i = 0; i < num; i++) {
        arr.push(gen())
    }
    return arr
}

export const randomDbEntities = (columns: string[]) => {
    const num = chance.natural({ min: 2, max: 20 })
    const arr = []
    for (let i = 0; i < num; i++) {
        arr.push(randomDbEntity(columns))
    }
    return arr
}

export const randomNumberDbEntity = (columns: InputField[]) => {
    const entity = {
        _id: chance.guid(),
        _createdDate: newDate(),
        _updatedDate: newDate(),
        _owner: chance.guid(),
    }

    const _columns = columns || []

    _columns.forEach((column: InputField) => {
        if (column.type === 'number' && column.subtype === 'int') {
            entity[column.name] = chance.integer({ min: 0, max: 10000 })
        } else if (column.type === 'number' && column.subtype === 'decimal') {
            entity[column.name] = chance.floating({ min: 0, max: 10000, fixed: 2 })
        }
    })

    return entity
}

export const randomObjectDbEntity = (columns: InputField[]) => {
    const entity = {
        _id: chance.guid(),
        _createdDate: newDate(),
        _updatedDate: newDate(),
        _owner: chance.guid(),
    }

    const _columns = columns || []

    _columns.forEach((column: InputField) => entity[column.name] = ({ [chance.word()]: chance.word() }) )

    return entity
}

export const randomNumberColumns = (): InputField[] => {
    return [ { name: chance.word(), type: 'number', subtype: 'int', isPrimary: false },
             { name: chance.word(), type: 'number', subtype: 'decimal', precision: '10,2', isPrimary: false } ]
}

export const randomColumn = (): InputField => ({ name: chance.word({ length: 6 }), type: 'text', subtype: 'string', precision: '256', isPrimary: false })

export const randomObjectColumn = () => ( { name: chance.word(), type: 'object' } )

export const randomCollectionName = () => chance.word({ length: 5 })

export const systemFieldsWith = (fields: InputField[]) => {
    const systemFields = SystemFields.map(({ name, type, subtype, isPrimary }) => ({ field: name, type, subtype, isPrimary }))
    return fields.reduce((pV: any, cV: { name: any; type: any; subtype: any; isPrimary: any }) =>
        [...pV, 
        {
            field: cV.name,
            type: cV.type,
            subtype: cV.subtype,
            isPrimary: cV.isPrimary
        }]
        , systemFields)
}

export const randomMatchesValueWithDashes = () => {
    const num = chance.natural({ min: 2, max: 5 })
    const arr = []
    for (let i = 0; i < num; i++) {
        arr.push(chance.word())
    }
    return arr.join('-')
}

export const randomCollection = (): collectionSpi.Collection => {
    return {
        id: randomCollectionName(),
        fields: schemaUtils.InputFieldsToWixFormatFields(SystemFields),
        pagingMode: collectionSpi.PagingMode.offset
    }
}

export const randomDomainIndex = (): DomainIndex => ({
    name: chance.word(),
    columns: randomArrayOf(() => chance.word()),
    isUnique: chance.bool(),
    caseInsensitive: chance.bool(),
    order: chance.pickone(['ASC', 'DESC']),
    status: DomainIndexStatus.ACTIVE,
})

export const randomSpiIndex = (): indexSpi.Index => ({
    name: chance.word(),
    fields: randomArrayOf(() => ({
        name: chance.word(),
        order: chance.pickone(['ASC', 'DESC']),
    })),
    unique: chance.bool(),
    caseInsensitive: chance.bool(),
})

export const spiIndexFor = (_collectionName: string, columns: string[]): indexSpi.Index => { 
    return {
        name: chance.word(),
        fields: columns.map((column: string) => ({ path: column, order: chance.pickone([IndexFieldOrder.ASC, IndexFieldOrder.DESC]) })),
        unique: chance.bool(),
        caseInsensitive: chance.bool(),
    }
}
