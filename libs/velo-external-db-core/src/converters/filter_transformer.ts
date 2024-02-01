import { AdapterOperators, isObject, patchVeloDateValue } from '@wix-velo/velo-external-db-commons'
import { EmptyFilter } from './utils'
import { errors } from '@wix-velo/velo-external-db-commons'
import { AdapterFilter, AdapterOperator, Sort, WixDataFilter, WixDataMultiFieldOperators, } from '@wix-velo/velo-external-db-types'
import { Sorting } from '../spi-model/data_source'
const { InvalidQuery } = errors

export interface IFilterTransformer {
    transform(filter: any): AdapterFilter
    isMultipleFieldOperator(filter: WixDataFilter): boolean
    wixOperatorToAdapterOperator(wixOperator: string): AdapterOperator
    isEmptyFilter(filter: any): boolean
}

export default class FilterTransformer implements IFilterTransformer {
    constructor() {

    }

    transform(filter: any): AdapterFilter {
        if (this.isEmptyFilter(filter)) return EmptyFilter

        if (this.isMultipleFieldOperator(filter)) {
            const wixOperator = Object.keys(filter)[0]
            const operator = this.wixOperatorToAdapterOperator(wixOperator)
            const values = filter[wixOperator]
            const res = values.map(this.transform.bind(this))
            return {
                operator,
                value: res
            }
        }
        
        const fieldName = Object.keys(filter)[0]
        const { value, operator: wixOperator } = this.valueAndOperatorFromFilter(filter, fieldName)
        const operator = this.wixOperatorToAdapterOperator(wixOperator)
        return { 
            operator: operator as AdapterOperator,
            fieldName,
            value: patchVeloDateValue(value)  
        }
    }

    transformSort(sort: any): Sort[] {
        if (!this.isSortArray(sort)) {
            return []
        }

        return (sort as Sorting[]).map(sorting => {
            return {
                fieldName: sorting.fieldName,
                direction: sorting.order.toLowerCase() as 'asc' | 'desc'
            }
        })
    }

    isMultipleFieldOperator(filter: WixDataFilter) {
        return (<any>Object).values(WixDataMultiFieldOperators).includes(Object.keys(filter)[0])
    }

    wixOperatorToAdapterOperator(wixOperator: string): AdapterOperator {
        return this.wixOperatorToAdapterOperatorString(wixOperator) as AdapterOperator
    }

    wixOperatorToAdapterOperatorString(operator: string) {
        switch (operator) {
            case '$eq':
                return AdapterOperators.eq
            case '$ne':
                return AdapterOperators.ne
            case '$lt':
                return AdapterOperators.lt
            case '$lte':
                return AdapterOperators.lte
            case '$gt': 
                return AdapterOperators.gt
            case '$gte':
                return AdapterOperators.gte
            case '$hasSome':
                return AdapterOperators.include
            case '$contains':
                return AdapterOperators.string_contains
            case '$startsWith':
                return AdapterOperators.string_begins
            case '$endsWith':
                return AdapterOperators.string_ends
            case '$or':
                return AdapterOperators.or
            case '$and':
                return AdapterOperators.and
            case '$not':
                return AdapterOperators.not
            case '$urlized':
                return AdapterOperators.urlized
            case '$matches':
                return AdapterOperators.matches //maybe replace spec, with pattern.
            default:
                throw new InvalidQuery(`Unrecognized operator ${operator}`)
        }
    }

    isEmptyFilter(filter: any): boolean {
        return (!filter || !isObject(filter) || Object.keys(filter)[0] === undefined)
    }

    isSortArray(sort: any): boolean {
        
        if (!Array.isArray(sort)) {
            return false
        }
        return sort.every((s: any) => {
            return this.isSortObject(s)
        })   
    }

    isSortObject(sort:any): boolean {
        return sort.fieldName && sort.order
    }

    valueAndOperatorFromFilter(filter: any, fieldName: string) {
        const filterValue = filter[fieldName]
        if (isObject(filterValue) && this.isOperator(Object.keys(filterValue)[0])) {
            const operator = Object.keys(filterValue)[0]
            const value = filterValue[operator]
            return {
                operator,
                value
            }
        }
        const operator = '$eq'
        const value = filterValue
        return {
            operator,
            value
        }
    }

    private isOperator(operator: string) {
        return operator.startsWith('$') && operator !== '$encrypted'
    }
}
