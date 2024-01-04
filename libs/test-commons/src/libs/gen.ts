import * as Chance from 'chance'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { Item } from '@wix-velo/velo-external-db-types'
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains } = AdapterOperators 

const chance = Chance()

export const randomObject = () => {
    const obj = {}
    const num = chance.natural({ min: 2, max: 20 })
    for (let i = 0; i < num; i++) {
        Object.assign(obj, { [chance.word()]: chance.sentence() })
    }
    return obj
}

export const randomEntities = (columns?: any) => {
    const num = chance.natural({ min: 2, max: 20 })
    const arr = []
    for (let i = 0; i < num; i++) {
        arr.push(randomEntity(columns))
    }
    return arr
}

const newDate = (year?: number) => {
    const d = year? new Date(year, 1) : new Date()
    d.setMilliseconds(0)    
    return d
}

export const randomArrayOf = (gen: { (): any; (): any }) => {
    const arr = []
    const num = chance.natural({ min: 2, max: 20 })
    for (let i = 0; i < num; i++) {
        arr.push(gen())
    }
    return arr
}

export const randomElementsFromArray = (arr: any[]) => {
    const quantity = chance.natural({ min: 1, max: arr.length-1 })
    return chance.pickset(arr, quantity)
}

export const randomCollectionName = () => chance.word({ length: 5 })

export const randomCollections = () => randomArrayOf( randomCollectionName )

export const randomFieldName = () => chance.word({ length: 5 })

export const randomEntity = (columns?: string[]) => {
    const entity : Item = {
        _id: chance.guid(),
        _createdDate: veloDate(),
        _updatedDate: veloDate(),
        _owner: chance.guid(),
    }

    const _columns = columns || []

    for (const column of _columns) {
        entity[column] = chance.word()
    }
    return entity
}

export const randomNumberEntity = (columns: any[]) => {
    const entity : Item = {
        _id: chance.guid(),
        _createdDate: veloDate(),
        _updatedDate: veloDate(),
        _owner: chance.guid(),
    }

    const _columns = columns || []

    _columns.forEach((column: any) => {
        if (column.type === 'number' && column.subtype === 'int') {
            entity[column.name] = chance.integer({ min: 0, max: 10000 })
        } else if (column.type === 'number' && column.subtype === 'decimal') {
            entity[column.name] = chance.floating({ min: 0, max: 10000, fixed: 2 })
        }
    })

    return entity
}


export const veloDate = () => ( { $date: newDate().toISOString() } )

export const pastVeloDate = () => ( { $date: newDate(2019).toISOString() } )

export const randomObjectFromArray = (array: any[]) => array[chance.integer({ min: 0, max: array.length - 1 })]

export const randomAdapterOperator = () => ( chance.pickone([ne, lt, lte, gt, gte, include, eq, string_contains, string_begins, string_ends]) )

export const randomAdapterOperatorWithoutInclude = () => ( chance.pickone([ne, lt, lte, gt, gte, eq, string_contains, string_begins, string_ends]) )

export const randomWrappedFilter = (_fieldName?: string, _operator?: string) => { // TODO: rename to randomDomainFilter
    const operator = _operator ?? randomAdapterOperator()
    const fieldName =  _fieldName ?? chance.word()
    const value = operator === AdapterOperators.include ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        fieldName,
        operator,
        value
    }
}

export const randomDomainFilterWithoutInclude = (_fieldName?: string) => {
    return randomWrappedFilter(_fieldName || chance.word(), randomAdapterOperatorWithoutInclude())
}
