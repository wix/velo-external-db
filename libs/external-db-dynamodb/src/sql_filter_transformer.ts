import { errors } from '@wix-velo/velo-external-db-commons'
import { isEmptyFilter } from '@wix-velo/velo-external-db-commons'
import { EmptyFilter } from './dynamo_utils'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { AdapterFilter as Filter, NotEmptyAdapterFilter as NotEmptyFilter, Sort } from '@wix-velo/velo-external-db-types' 
import { DynamoParsedFilter } from './types'
const { InvalidQuery } = errors
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not } = AdapterOperators

export default class FilterParser {
    constructor() {
    }

    transform(filter: Filter, fields?: any): { filterExpr: DynamoParsedFilter, queryable: boolean } {
        
        const results = this.parseFilter(filter)
        if (results.length === 0) {
            return { ...EmptyFilter, queryable: false }
        }

        const { filterExpr, queryable } = this.filterExprToQueryIfPossible(results[0].filterExpr, fields)
        
        return {
            filterExpr,
            queryable
        }
    }


    
    parseFilter(filter: Filter): { filterExpr: DynamoParsedFilter }[] {
        if (isEmptyFilter(filter)) {
            return []
        }

        const { operator, fieldName, value } =  filter as NotEmptyFilter
        
        switch (operator) {
            case and:
            case or:
                const res = value.map( this.parseFilter.bind(this) )
                const op = operator === and ? ' AND ' : ' OR '
                return [{
                    filterExpr: {
                        FilterExpression: res.map((r: { filterExpr: { FilterExpression: any } }[]) => r[0].filterExpr.FilterExpression).join( op ),
                        ExpressionAttributeNames: Object.assign ({}, ...res.map((r: { filterExpr: { ExpressionAttributeNames: any } }[]) => r[0].filterExpr.ExpressionAttributeNames) ),
                        ExpressionAttributeValues: Object.assign({}, ...res.map((r: { filterExpr: { ExpressionAttributeValues: any } }[]) => r[0].filterExpr.ExpressionAttributeValues) )
                    }
                }]
            case not:
                const res2 = this.parseFilter( value[0] )
                return [{
                    filterExpr: {
                        FilterExpression: `NOT (${res2[0].filterExpr.FilterExpression})`,
                        ExpressionAttributeNames: res2[0].filterExpr.ExpressionAttributeNames,
                        ExpressionAttributeValues: res2[0].filterExpr.ExpressionAttributeValues
                    }
                }]
        }
        
        if (this.isSingleFieldOperator(operator)) {
            return [{
                filterExpr: {
                    FilterExpression: `#${fieldName} ${this.adapterOperatorToDynamoOperator(operator)} :${fieldName}`,
                    ExpressionAttributeNames: {
                        [`#${fieldName}`]: fieldName
                    },
                    ExpressionAttributeValues: {
                        [`:${fieldName}`]: this.valueForOperator(value, operator)
                    }
                }
            }]
        }

        if (this.isSingleFieldStringOperator(operator)) {
            return [{
                filterExpr: {
                    FilterExpression: `${this.adapterOperatorToDynamoOperator(operator)} (#${fieldName}, :${fieldName})`,
                    ExpressionAttributeNames: {
                        [`#${fieldName}`]: fieldName
                    },
                    ExpressionAttributeValues: {
                        [`:${fieldName}`]: value
                    }
                }
            }]
        }


        if (operator === include) {
            
            if (value === undefined || value.length === 0)
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')

            return [{
                filterExpr: {
                    FilterExpression: `#${fieldName} IN (${value.map((_v: any, i: any) => `:${i}`).join(', ')})`,
                    ExpressionAttributeNames: {
                        [`#${fieldName}`]: fieldName
                    },
                    ExpressionAttributeValues: value.reduce((pV: any, cV: any, i: any) => ({ ...pV, [`:${i}`]: cV }), {})                 
                }
            }] 

        }

        return []
    }

    isSingleFieldOperator(operator: string) {
        return [ne, lt, lte, gt, gte, eq].includes(operator)
    }

    isSingleFieldStringOperator(operator: string) {
        return [ string_contains, string_begins, string_ends].includes(operator)
    }

    valueForOperator(value: string | any[] | undefined, operator: string) {
        if (operator === include && (value === undefined || value.length === 0)) {
            throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
        }
        if (operator === eq && value === undefined) {
            return null
        }

        return value
    }

    adapterOperatorToDynamoOperator(operator: any) {
        switch (operator) {
            case eq:
                return '='
            case ne:
                return '<>'
            case lt:
                return '<'
            case lte:
                return '<='
            case gt:
                return '>'
            case gte:
                return '>='
            case include:
                return 'IN'
            case string_contains:
                return 'contains'
            case string_begins:
                return 'begins_with'
            case string_ends:
                //not exists maybe use contains and then locally
                return 'ends_with'
            default:
                return ''

        }
    }

    filterExprToQueryIfPossible(filterExpr: DynamoParsedFilter, fields: any): { filterExpr: DynamoParsedFilter, queryable: boolean } {
        const queryable = this.canQuery(filterExpr, fields)
        if (queryable) 
            filterExpr = this.filterExprToQueryExpr(filterExpr)
        
        return { filterExpr, queryable }     
    }

    filterExprToQueryExpr(filter: DynamoParsedFilter) {
        delete Object.assign(filter, { ['KeyConditionExpression']: filter['FilterExpression'] })['FilterExpression']
        return filter
    }

    canQuery(filterExpr: DynamoParsedFilter, _fields: any) {
        // const collectionKeys = fields.filter(f=>f.isPrimary).map(f=>f.name)
        const collectionKeys = ['_id']

        if (!filterExpr) return false
        
        const filterAttributes = filterExpr.ExpressionAttributeNames ? Object.values(filterExpr.ExpressionAttributeNames) : []
        return filterAttributes.every(v => collectionKeys.includes(v))
    }

    selectFieldsFor(projection: any[]): { projectionExpr: string, projectionAttributeNames: {[key: string]: string} } { 
        const projectionExpr = projection.map((f: any) => `#${f}`).join(', ')
        const projectionAttributeNames = projection.reduce((pV: any, cV: any) => (
            { ...pV, [`#${cV}`]: cV }
        ), {})
        return { projectionExpr, projectionAttributeNames }
    }
}
