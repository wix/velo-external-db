import { AdapterOperators, isObject } from '@wix-velo/velo-external-db-commons'
import { EmptyFilter } from './utils'
import { errors } from '@wix-velo/velo-external-db-commons'
import { AdapterFilter, AdapterOperator, WixDataFilter, WixDataMultiFieldOperators, } from '@wix-velo/velo-external-db-types'
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
                operator: operator,
                value: res
            }
        }

        const fieldName = Object.keys(filter)[0]
        const wixOperator = Object.keys(filter[fieldName])[0]
        const operator = this.wixOperatorToAdapterOperator(wixOperator)
        const value = filter[fieldName][wixOperator]
        return {
            operator: operator as AdapterOperator,
            fieldName,
            value
        }
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

}
