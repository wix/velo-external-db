const { InvalidQuery } = require('velo-external-db-commons').errors
const { EMPTY_FILTER, EMPTY_SORT, isObject, AdapterOperators, AdapterFunctions, extractProjectionFunctionsObjects, extractGroupByNames, isEmptyFilter } = require('velo-external-db-commons')
const { escapeIdentifier } = require('./postgres_utils')
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized } = AdapterOperators
const { avg, max, min, sum, count } = AdapterFunctions

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

    adapterFunction2Sql(f) {
        switch (f) {
            case avg:
                return 'AVG'
            case max:
                return 'MAX'
            case min:
                return 'MIN'
            case sum:
                return 'SUM'
            case count:
                return 'COUNT'
            default:
                throw new InvalidQuery(`Unrecognized function ${f}`)
        }
    }

    parseAggregation(aggregation, offset) {

        const groupByColumns = extractGroupByNames(aggregation.projection)
        
        const projectionFunctions = extractProjectionFunctionsObjects(aggregation.projection)

        const { filterColumnsStr, aliasToFunction }  = this.createFieldsStatementAndAliases(projectionFunctions, groupByColumns)

        const havingFilter = this.parseFilter(aggregation.postFilter, offset, aliasToFunction)

        const { filterExpr, parameters } = this.extractFilterExprAndParams(havingFilter, offset, aliasToFunction)

        return {
            fieldsStatement: filterColumnsStr.join(', '),
            groupByColumns,
            havingFilter: filterExpr,
            parameters: parameters,
        }
    }

    createFieldsStatementAndAliases(projectionFunctions, groupByColumns) {
        const filterColumnsStr = []
        const aliasToFunction = {}
        groupByColumns.forEach(f => filterColumnsStr.push(escapeIdentifier(f)))
        projectionFunctions.forEach(f => { 
            filterColumnsStr.push(`${this.adapterFunction2Sql(f.function)}(${escapeIdentifier(f.name)}) AS ${escapeIdentifier(f.alias)}`)
            aliasToFunction[f.alias] = `${this.adapterFunction2Sql(f.function)}(${escapeIdentifier(f.name)})`
        })

        return { filterColumnsStr, aliasToFunction }
    }

    extractFilterExprAndParams(havingFilter) {
        return havingFilter.map(({ filterExpr, parameters }) => ({ filterExpr: filterExpr !== '' ? `HAVING ${filterExpr}` : '',
                                                                     parameters: parameters }))
                           .concat(EMPTY_FILTER)[0]
    }

    parseFilter(filter, offset, inlineFields) {

        if (isEmptyFilter(filter)) {
            return []
        }
        
        const { operator, fieldName, value } = filter
        
        switch (operator) {
            case and:
            case or:
                const res = value.reduce((o, f) => {
                    const res = this.parseFilter.bind(this)(f, o.offset, inlineFields)
                    return {
                        filter: o.filter.concat( ...res ),
                        offset: res.length === 1 ? res[0].offset : o.offset
                    }
                }, { filter: [], offset: offset })

                const op = operator === and ? ' AND ' : ' OR '
                return [{
                    filterExpr: res.filter.map(r => r.filterExpr).join( op ),
                    filterColumns: [],
                    offset: res.offset,
                    parameters: res.filter.map( s => s.parameters ).flat()
                }]
            case not:
                const res2 = this.parseFilter( value[0], offset, inlineFields )
                return [{
                    filterExpr: `NOT (${res2[0].filterExpr})`,
                    filterColumns: [],
                    offset: res2.length === 1 ? res2[0].offset : offset,
                    parameters: res2[0].parameters
                }]
        }

        if (this.isSingleFieldOperator(operator)) {
            const params = this.valueForOperator(value, operator, offset)

            return [{
                filterExpr: `${this.inlineVariableIfNeeded(fieldName, inlineFields)} ${this.adapterOperatorToMySqlOperator(operator, value)} ${params.sql}`.trim(),
                filterColumns: [],
                offset: params.offset,
                parameters: value !== undefined ? [].concat( this.patchTrueFalseValue(value) ) : []
            }]
        }


        if (this.isSingleFieldStringOperator(operator)) {
            return [{
                filterExpr: `${this.inlineVariableIfNeeded(fieldName, inlineFields)} LIKE $${offset}`,
                filterColumns: [],
                offset: offset + 1,
                parameters: [this.valueForStringOperator(operator, value)]
            }]
        }

        if (operator === urlized) {
            return [{
                filterExpr: `LOWER(${escapeIdentifier(fieldName)}) RLIKE $${offset}`,
                filterColumns: [],
                offset: offset + 1,
                parameters: [value.map(s => s.toLowerCase()).join('[- ]')]
            }]
        }

        return []
    }

    valueForStringOperator(operator, value) {
        switch (operator) {
            case string_contains:
                return `%${value}%`
            case string_begins:
                return `${value}%`
            case string_ends:
                return `%${value}`
        }
    }

    isSingleFieldOperator(operator) {
        return [ne, lt, lte, gt, gte, include, eq].includes(operator)
    }

    isSingleFieldStringOperator(operator) {
        return [string_contains, string_begins, string_ends].includes(operator)
    }

    prepareStatementVariables(n, offset) {
        return Array.from({ length: n }, (_, i) => `$${offset + i}`)
                    .join(', ')
    }


    valueForOperator(value, operator, offset) {
        if (operator === include) {
            if (value === undefined || value.length === 0) {
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
            }
            return {
                sql: `(${this.prepareStatementVariables(value.length, offset)})`,
                offset: offset + value.length
            }
        } else if (operator === eq && value === undefined) {
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

    adapterOperatorToMySqlOperator(operator, value) {
        switch (operator) {
            case eq:
                if (value !== undefined) {
                    return '='
                }
                return 'IS NULL'
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

    projection(projection) {
        if (!projection) return '*'
        return projection.map(escapeIdentifier).join(', ')
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