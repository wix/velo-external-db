import { errors } from '@wix-velo/velo-external-db-commons'
import { isObject, AdapterOperators, isEmptyFilter } from '@wix-velo/velo-external-db-commons'
import { EmptySort } from './airtable_utils'
import { AdapterFilter as Filter, AdapterOperator, Sort } from '@wix-velo/velo-external-db-types' 
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized } = AdapterOperators
const { InvalidQuery } = errors

export interface IAirtableFilterParser {
    transform(filter: Filter): { filterExpr: string } | any[] // never[] is a hack to make the type checker happy
    orderBy(sort: Sort[]): { sort: { field: string; direction: string }[] }
    selectFieldsFor(projection: any): any
}


export default class FilterParser implements IAirtableFilterParser {
    constructor() {
    }

    transform(filter: Filter) {
        const results = this.parseFilter(filter)
        if (results.length === 0) {
            return []
        }
        return {
            filterExpr: results[0].filterExpr
        }
    }


    parseFilter(filter: Filter): { filterExpr: string }[] {
        if (isEmptyFilter(filter)) {
            return []
        }

        const { operator, fieldName, value } = filter

        switch (operator) {
            case and:
            case or:
                const res = value.map(this.parseFilter.bind(this))
                const op = operator === and ? 'AND' : 'OR' 
                return [{
                    filterExpr: this.multipleFieldOperatorToFilterExpr(op, res)
                }]

            case not:
                const res2 = this.parseFilter(value[0])
                return [{
                    filterExpr: `NOT(${res2[0].filterExpr})`
                }]
            case include:
                if (value === undefined || value.length === 0) {
                    throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
                }

                const ress = value.map((val: any) => { return { fieldName,
                                                         operator: eq,
                                                         value: val }
                                              }
                                      )
                const ress2 = ress.map(this.parseFilter.bind(this))
                return [{
                    filterExpr: this.multipleFieldOperatorToFilterExpr('OR', ress2)
                }]

        }


        if (this.isSingleFieldOperator(operator)) {
            return [{
                filterExpr: `${fieldName} ${this.adapterOperatorToAirtableOperator(operator)} ${this.valueForOperator(value, operator)}`
            }]
        }

        if (this.isSingleFieldStringOperator(operator)) {
           return[{
               filterExpr: `REGEX_MATCH({${fieldName}},'${this.valueForStringOperator(operator, value)}')` }]
        }

        if (operator === urlized) {
            console.error('not implemented')
        }
        return []
    }

    multipleFieldOperatorToFilterExpr(operator: string, values: any[]) {
        return `${operator}(${values.map((r: { filterExpr: any }[]) => r[0]?.filterExpr).join(',')})`
    }

    valueForStringOperator(operator: AdapterOperator, value: any) {
        switch (operator) {
            case string_contains:
                return value
            case string_begins:
                return `^${value}`
            case string_ends:
                return `${value}$`
        }
    }

    valueForOperator(value: string | any[] | undefined, operator: string) {
        if (operator === include) {
            if (value === undefined || !Array.isArray(value) || value.length === 0) {
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
            }
            return this.multipleFieldOperatorToFilterExpr('OR', value)
        }
        else if (operator === eq && value === undefined) {
            return '""'
        }

        return `"${value}"`
    }

    isSingleFieldOperator(operator: AdapterOperator) {
        return [ne, lt, lte, gt, gte, include, eq].includes(operator)
    }

    isSingleFieldStringOperator(operator: AdapterOperator) {
        return [string_contains, string_begins, string_ends].includes(operator)
    }

    adapterOperatorToAirtableOperator(operator: AdapterOperator) {
        switch (operator) {
            case eq:
                return '='
            case ne:
                return '!='
            case lt:
                return '<'
            case lte:
                return '<='
            case gt:
                return '>'
            case gte:
                return '>='
            default:
                return operator
        }
    }

    orderBy(sort: Sort[]) {
        if (!Array.isArray(sort) || !sort.every(isObject)) {
            return EmptySort
        }

        const results=  sort.flatMap(this.parseSort)
        if (results.length === 0) {
            return EmptySort
        }

        return {
            sort: results
        }
    }

    parseSort({ fieldName, direction }: Sort): { field: string; direction: string } | [] {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'ASC'

        const dir = 'ASC' === _direction.toUpperCase() ? 'asc' : 'desc'

        return { field: fieldName, direction: dir }

    }

    selectFieldsFor(projection: any) {
        return projection
    }

}
