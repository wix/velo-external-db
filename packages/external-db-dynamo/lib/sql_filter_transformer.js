const { InvalidQuery } = require('velo-external-db-commons').errors
const { EMPTY_SORT, isObject } = require('velo-external-db-commons')
const { EMPTY_FILTER } = require('./dynamo_utils')

class FilterParser {
    constructor() {
    }

    transform(filter) {
        const results = this.parseFilter(filter)

        if (results.length === 0) {
            return {filterExpr:{}}
        }

        return {
            filterExpr: results[0].filterExpr
        }
    }

    // wixDataFunction2Sql(f) {
    //     switch (f) {
    //         case '$avg':
    //             return 'AVG'
    //         case '$max':
    //             return 'MAX'
    //         case '$min':
    //             return 'MIN'
    //         case '$sum':
    //             return 'SUM'
    //         default:
    //             throw new InvalidQuery(`Unrecognized function ${f}`)
    //     }
    // }

    // parseAggregation(aggregation, postFilter) {
    //     const groupByColumns = []
    //     const filterColumnsStr = []
    //     if (isObject(aggregation._id)) {
    //         filterColumnsStr.push(...Object.values(aggregation._id).map(f => escapeId(f) ))
    //         groupByColumns.push(...Object.values(aggregation._id))
    //     } else {
    //         filterColumnsStr.push(aggregation._id)
    //         groupByColumns.push(aggregation._id)
    //     }

    //     Object.keys(aggregation)
    //           .filter(f => f !== '_id')
    //           .forEach(fieldAlias => {
    //               Object.entries(aggregation[fieldAlias])
    //                     .forEach(([func, field]) => {
    //                         filterColumnsStr.push(`${this.wixDataFunction2Sql(func)}(${escapeId(field)}) AS ${escapeId(fieldAlias)}`)
    //                     })
    //           })

    //     const havingFilter = this.parseFilter(postFilter)
    //     const {filterExpr, parameters} =
    //         havingFilter.map(({filterExpr, parameters}) => ({ filterExpr: filterExpr !== '' ? `HAVING ${filterExpr}` : '',
    //                                                           parameters: parameters}))
    //                     .concat(EMPTY_FILTER)[0]


    //     return {
    //         fieldsStatement: filterColumnsStr.join(', '),
    //         groupByColumns,
    //         havingFilter: filterExpr,
    //         parameters: parameters,
    //     }
    // }

    parseFilter(filter) {
        if (!filter || !isObject(filter)|| filter.operator === undefined) {
            return []
        }
        // switch (filter.operator) {
        //     case '$and':
        //     case '$or':
        //         const res = filter.value.map( this.parseFilter.bind(this) )
        //         const op = filter.operator === '$and' ? ' AND ' : ' OR '
        //         return [{
        //             filterExpr: res.map(r => r[0].filterExpr).join( op ),
        //             parameters: res.map( s => s[0].parameters ).flat()
        //         }]
        //     case '$not':
        //         const res2 = this.parseFilter( filter.value )
        //         return [{
        //             filterExpr: `NOT (${res2[0].filterExpr})`,
        //             parameters: res2[0].parameters
        //         }]
        // }

        const fieldName = filter.fieldName 
        const value = filter.value
        if (filter.operator === '$hasSome') {
            
            if (filter.operator === '$hasSome' && (value === undefined || value.length === 0))
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')

            const filterExpressionVariables = {...value}

            return [{
                filterExpr: {
                    FilterExpression: `#${fieldName} IN (${Object.keys(filterExpressionVariables).map(f => `:${f}`).join(', ')})`,
                    ExpressionAttributeNames: {
                        [`#${fieldName}`] : fieldName
                    },
                    ExpressionAttributeValues: {
                        ...filterExpressionVariables
                    }
                }
            }] 

        }
        
        if (this.isSingleFieldOperator(filter.operator)) {
            return [{
                filterExpr: {
                    FilterExpression: `#${fieldName} ${this.veloOperatorToDynamoOperator(filter.operator)} :${fieldName}`,
                    ExpressionAttributeNames: {
                        [`#${fieldName}`]: fieldName
                    },
                    ExpressionAttributeValues: {
                        [`:${fieldName}`]: this.valueForOperator(filter.value, filter.operator)
                    }
                }
            }]
        }

        if (this.isSingleFieldStringOperator(filter.operator)) {
            return [{
                filterExpr: {
                    FilterExpression: ,
                    ExpressionAttributeNames: {
                        [`#${fieldName}`] : fieldName
                    },
                    ExpressionAttributeValues: {
                        [`:${fieldName}`] : filter.value
                    }
                }
                // `${filter.fieldName} ${this.veloOperatorToDynamoOperator(filter.operator, filter.value)} ${filter.value}` // TODO: value for operator?
            }]
        }

        // if (filter.operator === '$urlized') {
        //     return [{
        //         filterExpr: `LOWER(${escapeId(filter.fieldName)}) RLIKE ?`,
        //         parameters: [filter.value.map(s => s.toLowerCase()).join('[- ]')]
        //     }]
        // }

        return []
    }

    valueForStringOperator(operator, value) {
        switch (operator) {
            case '$contains':
                return `%${value}%`
            case '$startsWith':
                return `${value}%`
            case '$endsWith':
                return `%${value}`
        }
    }

    isSingleFieldOperator(operator) {
        return ['$ne', '$lt', '$lte', '$gt', '$gte', '$eq'].includes(operator)
    }

    isSingleFieldStringOperator(operator) {
        return ['$contains', '$startsWith', '$endsWith'].includes(operator)
    }

    valueForOperator(value, operator) {
        if (operator === '$hasSome' && (value === undefined || value.length === 0)) {
            throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
        }
        if (operator === '$eq' && value === undefined) {
            return null
        }

        return value
    }

    veloOperatorToDynamoOperator(operator) {
        switch (operator) {
            case '$eq':
                return '='
            case '$ne':
                return '<>'
            case '$lt':
                return '<'
            case '$lte':
                return '<='
            case '$gt':
                return '>'
            case '$gte':
                return '>='
            case '$hasSome':
                return 'IN'
            case '$contains':
                return 'contains'
            case '$startsWith':
                return 'begins_with'
            case '$endsWith':
                return ''
        }
    }

    orderBy(sort) {
        if (!Array.isArray(sort) || !sort.every(isObject)) {
            return EMPTY_SORT;
        }

        const results = sort.flatMap( this.parseSort )

        if (results.length === 0) {
            return EMPTY_SORT
        }

        return {
            sortExpr: `ORDER BY ${results.map( s => s.expr).join(', ')}`
        }
    }

    parseSort({ fieldName, direction }) {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'ASC'

        const dir = 'ASC' === _direction.toUpperCase() ? 'ASC' : 'DESC';

        return [{
            expr: `${escapeId(fieldName)} ${dir}`,
        }]
    }

    patchTrueFalseValue(value) {
        if (value === true || value === false) {
            return value ? 1 : 0
        }
        return value
    }
}

module.exports = FilterParser