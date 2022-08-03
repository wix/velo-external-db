import * as Chance from 'chance'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
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

const newDate = () => {
    const d = new Date()
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

export const randomEntity = (columns?: any[]) => {
    const entity : {[x:string]: any} = {
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

export const veloDate = () => ( { $date: newDate().toISOString() } )

export const randomObjectFromArray = (array: any[]) => array[chance.integer({ min: 0, max: array.length - 1 })]

export const randomAdapterOperator = () => ( chance.pickone([ne, lt, lte, gt, gte, include, eq, string_contains, string_begins, string_ends]) )

export const randomWrappedFilter = (_fieldName?: string) => {
    const operator = randomAdapterOperator()
    const fieldName =  _fieldName ?? chance.word()
    const value = operator === AdapterOperators.include ? [chance.word(), chance.word(), chance.word(), chance.word(), chance.word()] : chance.word()
    return {
        fieldName,
        operator,
        value
    }
}
