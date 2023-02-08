import { errors, patchDateTimeValue } from '@wix-velo/velo-external-db-commons'
import { isEmptyFilter } from '@wix-velo/velo-external-db-commons'
import { attributeValueNameWithCounter, EmptyFilter, fieldNameWithCounter as attributeNameWithCounter } from './dynamo_utils'
import { AdapterOperators } from '@wix-velo/velo-external-db-commons'
import { AdapterFilter as Filter, NotEmptyAdapterFilter as NotEmptyFilter } from '@wix-velo/velo-external-db-types' 
import { DynamoParsedFilter } from './types'
const { InvalidQuery } = errors
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not } = AdapterOperators

export type Counter = {
    nameCounter: number,
    valueCounter: number
}

export default class FilterParser {
    constructor() {
    }

    transform(filter: Filter, fields?: any): { filterExpr: DynamoParsedFilter, queryable: boolean } {
        const counter = { nameCounter: 0, valueCounter: 0 }
        const results = this.parseFilter(filter, counter)
        if (results.length === 0) {
            return { ...EmptyFilter, queryable: false }
        }

        const { filterExpr, queryable } = this.filterExprToQueryIfPossible(results[0].filterExpr, fields, (filter as NotEmptyFilter).operator)
        
        return {
            filterExpr,
            queryable
        }
    }


    
    parseFilter(filter: Filter, counter: Counter = { nameCounter: 0, valueCounter: 0 }): { filterExpr: DynamoParsedFilter }[] {
        if (isEmptyFilter(filter)) {
            return []
        }
        
        const { operator, fieldName, value: _value } =  filter as NotEmptyFilter
        const value = patchDateTimeValue(_value)
        
        switch (operator) {
            case and:
            case or:
                const res = value.map((f:Filter) =>  this.parseFilter.bind(this)(f, counter) )
                const op = operator === and ? ' AND ' : ' OR '
                return [{
                    filterExpr: {
                        FilterExpression: `(${res.map((r: { filterExpr: { FilterExpression: any } }[]) => r[0].filterExpr.FilterExpression).join( op )})`,
                        ExpressionAttributeNames: Object.assign ({}, ...res.map((r: { filterExpr: { ExpressionAttributeNames: any } }[]) => r[0].filterExpr.ExpressionAttributeNames) ),
                        ExpressionAttributeValues: Object.assign({}, ...res.map((r: { filterExpr: { ExpressionAttributeValues: any } }[]) => r[0].filterExpr.ExpressionAttributeValues) )
                    }
                }]
            case not:
                const res2 = this.parseFilter( value[0], counter )
                return [{
                    filterExpr: {
                        FilterExpression: `NOT (${res2[0].filterExpr.FilterExpression})`,
                        ExpressionAttributeNames: res2[0].filterExpr.ExpressionAttributeNames,
                        ExpressionAttributeValues: res2[0].filterExpr.ExpressionAttributeValues
                    }
                }]
        }
        
        const expressionAttributeName = attributeNameWithCounter(fieldName, counter)
       
        if (this.isNestedField(fieldName)) {
            const expressionAttributeValue = attributeValueNameWithCounter(fieldName, counter)
            return [{
                filterExpr: {
                    FilterExpression: `${expressionAttributeName} ${this.adapterOperatorToDynamoOperator(operator)} ${expressionAttributeValue}`,
                    ExpressionAttributeNames: expressionAttributeName.split('.').reduce((pV, cV) => ({
                        ...pV,
                        [cV]: cV.slice(1, cV.length - 1)
                    }), {}),
                    ExpressionAttributeValues: {
                        [expressionAttributeValue]: this.valueForOperator(value, operator)
                    }
                }
            }]
        }

        if (this.isSingleFieldOperator(operator)) {
            const expressionAttributeValue = attributeValueNameWithCounter(fieldName, counter)
            return [{
                filterExpr: {
                    FilterExpression: `${expressionAttributeName} ${this.adapterOperatorToDynamoOperator(operator)} ${expressionAttributeValue}`,
                    ExpressionAttributeNames: {
                        [expressionAttributeName]: fieldName
                    },
                    ExpressionAttributeValues: {
                        [expressionAttributeValue]: this.valueForOperator(value, operator)
                    }
                }
            }]
        }
        
        if (this.isSingleFieldStringOperator(operator)) {
            const expressionAttributeValue = attributeValueNameWithCounter(fieldName, counter)
            return [{
                filterExpr: {
                    FilterExpression: `${this.adapterOperatorToDynamoOperator(operator)} (${expressionAttributeName}, ${expressionAttributeValue})`,
                    ExpressionAttributeNames: {
                        [expressionAttributeName]: fieldName
                    },
                    ExpressionAttributeValues: {
                        [expressionAttributeValue]: value
                    }
                }
            }]
        }


        if (operator === include) {
            
            if (value === undefined || value.length === 0)
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
                            
            const expressionAttributeValue = Array.from(value, _ => attributeValueNameWithCounter(fieldName, counter))
            
            return [{
                filterExpr: {
                    FilterExpression: `${expressionAttributeName} IN (${expressionAttributeValue.join(', ')})`,
                    ExpressionAttributeNames: {
                        [expressionAttributeName]: fieldName
                    },
                    ExpressionAttributeValues: expressionAttributeValue.reduce((pV, cV, i) => ({
                        ...pV,
                        [cV]: value[i]
                    }), {})
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

    isNestedField(fieldName: string) {
        return fieldName.includes('.')
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

    filterExprToQueryIfPossible(filterExpr: DynamoParsedFilter, fields: any, operator: string): { filterExpr: DynamoParsedFilter, queryable: boolean } {
        const queryable = this.canQuery(filterExpr, fields, operator)
        if (queryable) 
            filterExpr = this.filterExprToQueryExpr(filterExpr)
        
        return { filterExpr, queryable }     
    }

    filterExprToQueryExpr(filter: DynamoParsedFilter) {
        delete Object.assign(filter, { ['KeyConditionExpression']: filter['FilterExpression'] })['FilterExpression']
        return filter
    }

    canQuery(filterExpr: DynamoParsedFilter, _fields: any, operator: string) {
        // const collectionKeys = fields.filter(f=>f.isPrimary).map(f=>f.name)
        const collectionKeys = ['_id']

        if (!filterExpr) return false
        
        const filterAttributes = filterExpr.ExpressionAttributeNames ? Object.values(filterExpr.ExpressionAttributeNames) : []
        return (filterAttributes.every(v => collectionKeys.includes(v)) && operator === eq)
    }

    selectFieldsFor(projection: any[]): { projectionExpr: string, projectionAttributeNames: {[key: string]: string} } { 
        const projectionExpr = projection.map((f: any) => `#${f}`).join(', ')
        const projectionAttributeNames = projection.reduce((pV: any, cV: any) => (
            { ...pV, [`#${cV}`]: cV }
        ), {})
        return { projectionExpr, projectionAttributeNames }
    }
}
