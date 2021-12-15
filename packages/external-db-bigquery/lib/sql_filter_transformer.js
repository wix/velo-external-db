const { InvalidQuery } = require('velo-external-db-commons').errors
const { EMPTY_FILTER, EMPTY_SORT, isObject, isEmptyFilter, extractFilterObjects, patchAggregationObject } = require('velo-external-db-commons')

const escapeIdentifier = i => i
const wildCardWith = i => i 

class FilterParser {
    constructor() {
    }

    transform(filter) {
        const results = this.parseFilter(filter)

        if (results.length === 0) {
            return EMPTY_FILTER
        }

        return {
            filterExpr: `WHERE ${results[0].filterExpr}`,
            parameters: results[0].parameters
        }
    }

    wixDataFunction2Sql(f) {
        switch (f) {
            case '$avg':
                return 'AVG'
            case '$max':
                return 'MAX'
            case '$min':
                return 'MIN'
            case '$sum':
                return 'SUM'
            case '$count':
                return 'COUNT'
            default:
                throw new InvalidQuery(`Unrecognized function ${f}`)
        }
    }

    parseAggregation(aggregation, postFilter) {
        const _aggregation = patchAggregationObject(aggregation)
        const groupByColumns = []
        const filterColumnsStr = []
        if (isObject(_aggregation._id)) {
            filterColumnsStr.push(...Object.values(_aggregation._id).map(f => escapeIdentifier(f) ))
            groupByColumns.push(...Object.values(_aggregation._id))
        } else {
            filterColumnsStr.push(escapeIdentifier(_aggregation._id))
            groupByColumns.push(_aggregation._id)
        }

        const aliasToFunction = {}
        Object.keys(_aggregation)
              .filter(f => f !== '_id')
              .forEach(fieldAlias => {
                  Object.entries(_aggregation[fieldAlias])
                        .forEach(([func, field]) => {
                                filterColumnsStr.push(`CAST(${this.wixDataFunction2Sql(func)}(${escapeIdentifier(field)}) AS FLOAT64) AS ${escapeIdentifier(fieldAlias)}`)
                                aliasToFunction[fieldAlias] = `${this.wixDataFunction2Sql(func)}(${escapeIdentifier(field)})`
                            })
              })

        const havingFilter = this.parseFilter(postFilter)
        const { filterExpr, parameters } =
            havingFilter.map(({ filterExpr, parameters }) => ({ filterExpr: filterExpr !== '' ? `HAVING ${filterExpr}` : '',
                                                              parameters: parameters }))
                        .concat(EMPTY_FILTER)[0]


        return {
            fieldsStatement: filterColumnsStr.join(', '),
            groupByColumns,
            havingFilter: filterExpr,
            parameters: parameters,
        }
    }

    parseFilter(filter) {
        if (isEmptyFilter(filter)) {
            return []
        }

        const { operator, fieldName, value } = extractFilterObjects(filter)

        switch (operator) {
            case '$and':
            case '$or':
                const res = value.map( this.parseFilter.bind(this) )
                const op = operator === '$and' ? ' AND ' : ' OR '
                return [{
                    filterExpr: res.map(r => r[0].filterExpr).join( op ),
                    parameters: res.map( s => s[0].parameters ).flat()
                }]
            case '$not':
                const res2 = this.parseFilter( value[0] )
                return [{
                    filterExpr: `NOT (${res2[0].filterExpr})`,
                    parameters: res2[0].parameters
                }]
        }

        if (this.isSingleFieldOperator(operator)) {
            return [{
                filterExpr: `${escapeIdentifier(fieldName)} ${this.veloOperatorToMySqlOperator(operator, value)} ${this.valueForOperator(value, operator)}`.trim(),
                parameters: value !== undefined ? [].concat( this.patchTrueFalseValue(value) ) : []
            }]
        }

        if (this.isSingleFieldStringOperator(operator)) {
            return [{
                filterExpr: `${escapeIdentifier(fieldName)} LIKE ?`,
                parameters: [this.valueForStringOperator(operator, value)]
            }]
        }

        if (operator === '$urlized') {
            return [{
                filterExpr: `LOWER(${escapeIdentifier(fieldName)}) RLIKE ?`,
                parameters: [value.map(s => s.toLowerCase()).join('[- ]')]
            }]
        }

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
        return ['$ne', '$lt', '$lte', '$gt', '$gte', '$hasSome', '$eq'].includes(operator)
    }

    isSingleFieldStringOperator(operator) {
        return ['$contains', '$startsWith', '$endsWith'].includes(operator)
    }

    valueForOperator(value, operator) {
        if (operator === '$hasSome') {
            if (value === undefined || value.length === 0) {
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
            }
            return `(${wildCardWith(value.length, '?')})`
        } else if (operator === '$eq' && value === undefined) {
            return ''
        }

        return '?'
    }

    veloOperatorToMySqlOperator(operator, value) {
        switch (operator) {
            case '$eq':
                if (value !== undefined) {
                    return '='
                }
                return 'IS NULL'
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
        }
    }

    orderBy(sort) {
        if (!Array.isArray(sort) || !sort.every(isObject)) {
            return EMPTY_SORT
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

        const dir = 'ASC' === _direction.toUpperCase() ? 'ASC' : 'DESC'

        return [{
            expr: `${escapeIdentifier(fieldName)} ${dir}`,
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