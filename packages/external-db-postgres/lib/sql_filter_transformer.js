const { InvalidQuery } = require('velo-external-db-commons').errors
const { EMPTY_FILTER, EMPTY_SORT, isObject, getFilterObject } = require('velo-external-db-commons')
const { escapeIdentifier } = require('./postgres_utils')

class FilterParser {
    constructor() {
    }

    transform(filter) {
        const results = this.parseFilter(filter, 1, {})

        if (results.length === 0) {
            return EMPTY_FILTER
        }

        return {
            filterExpr: `WHERE ${results[0].filterExpr}`,
            filterColumns: results[0].filterColumns,
            offset: results[0].offset,
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
            default:
                throw new InvalidQuery(`Unrecognized function ${f}`)
        }
    }

    parseAggregation(aggregation, postFilter, offset) {
        const groupByColumns = []
        const filterColumnsStr = []
        if (isObject(aggregation._id)) {
            filterColumnsStr.push(...Object.values(aggregation._id).map(val=>val.substring(1)).map( escapeIdentifier ))
            groupByColumns.push(...Object.values(aggregation._id).map(val=>val.substring(1)))
        } else {
            filterColumnsStr.push(escapeIdentifier(aggregation._id.substring(1)))
            groupByColumns.push(aggregation._id.substring(1))
        }

        const aliasToFunction = {}
        Object.keys(aggregation)
              .filter(f => f !== '_id')
              .forEach(fieldAlias => {
                  Object.entries(aggregation[fieldAlias])
                        .forEach(([func, field]) => {
                            filterColumnsStr.push(`${this.wixDataFunction2Sql(func)}(${escapeIdentifier(field.substring(1))}) AS ${escapeIdentifier(fieldAlias)}`)
                            aliasToFunction[fieldAlias] = `${this.wixDataFunction2Sql(func)}(${escapeIdentifier(field.substring(1))})`
                        })
              })

        const havingFilter = this.parseFilter(postFilter, offset, aliasToFunction)

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

    parseFilter(filter, offset, inlineFields) {

        if (!filter || !isObject(filter)) {
            return []
        }
        if (Object.keys(filter)[0] === undefined) {
            return []
        }
        
        const filterObj = getFilterObject(filter)
        
        switch (filterObj.operator) {
            case '$and':
            case '$or':
                const res = filterObj.value.reduce((o, f) => {
                    const res = this.parseFilter.bind(this)(f, o.offset, inlineFields)
                    return {
                        filter: o.filter.concat( ...res ),
                        offset: res.length === 1 ? res[0].offset : o.offset
                    }
                }, { filter: [], offset: offset })

                const op = filterObj.operator === '$and' ? ' AND ' : ' OR '
                return [{
                    filterExpr: res.filter.map(r => r.filterExpr).join( op ),
                    filterColumns: [],
                    offset: res.offset,
                    parameters: res.filter.map( s => s.parameters ).flat()
                }]
            case '$not':
                const res2 = this.parseFilter( filterObj.value[0], offset, inlineFields )
                return [{
                    filterExpr: `NOT (${res2[0].filterExpr})`,
                    filterColumns: [],
                    offset: res2.length === 1 ? res2[0].offset : offset,
                    parameters: res2[0].parameters
                }]
        }

        if (this.isSingleFieldOperator(filterObj.operator)) {
            const params = this.valueForOperator(filterObj.value, filterObj.operator, offset)

            return [{
                filterExpr: `${this.inlineVariableIfNeeded(filterObj.fieldName, inlineFields)} ${this.veloOperatorToMySqlOperator(filterObj.operator, filterObj.value)} ${params.sql}`.trim(),
                filterColumns: [],
                offset: params.offset,
                parameters: filterObj.value !== undefined ? [].concat( this.patchTrueFalseValue(filterObj.value) ) : []
            }]
        }


        if (this.isSingleFieldStringOperator(filterObj.operator)) {
            return [{
                filterExpr: `${this.inlineVariableIfNeeded(filterObj.fieldName, inlineFields)} LIKE $${offset}`,
                filterColumns: [],
                offset: offset + 1,
                parameters: [this.valueForStringOperator(filterObj.operator, filterObj.value)]
            }]
        }

        if (filterObj.operator === '$urlized') {
            return [{
                filterExpr: `LOWER(${escapeIdentifier(filterObj.fieldName)}) RLIKE $${offset}`,
                filterColumns: [],
                offset: offset + 1,
                parameters: [filterObj.value.map(s => s.toLowerCase()).join('[- ]')]
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

    prepareStatementVariables(n, offset) {
        return Array.from({ length: n }, (_, i) => `$${offset + i}`)
                    .join(', ')
    }


    valueForOperator(value, operator, offset) {
        if (operator === '$hasSome') {
            if (value === undefined || value.length === 0) {
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
            }
            return {
                sql: `(${this.prepareStatementVariables(value.length, offset)})`,
                offset: offset + value.length
            }
        } else if (operator === '$eq' && value === undefined) {
            return {
                sql: '',
                offset: offset
            }
        }

        return {
            sql: `$${offset}`,
            offset: offset + 1
        }
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
            expr: `${escapeIdentifier(fieldName)} ${dir}`
        }]
    }

    patchTrueFalseValue(value) {
        if (value === true || value === false) {
            return value ? 1 : 0
        }
        return value
    }

    inlineVariableIfNeeded(fieldName, inlineFields) {
        if (inlineFields) {
            if (inlineFields[fieldName]) {
                return inlineFields[fieldName]
            }
        }
        return escapeIdentifier(fieldName)
    }
}

module.exports = FilterParser