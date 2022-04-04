const { InvalidQuery } = require('velo-external-db-commons').errors
const { escapeIdentifier, wildCardWith } = require('./bigquery_utils')
const { EmptyFilter, EmptySort, isObject, isEmptyFilter, AdapterOperators, AdapterFunctions, extractGroupByNames, extractProjectionFunctionsObjects, isNull } = require('velo-external-db-commons')
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized } = AdapterOperators
const { avg, max, min, sum, count } = AdapterFunctions

class FilterParser {
    constructor() {
    }

    transform(filter) {
        const results = this.parseFilter(filter)

        if (results.length === 0) {
            return EmptyFilter
        }

        return {
            filterExpr: `WHERE ${results[0].filterExpr}`,
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

    parseAggregation(aggregation) {
        
        const groupByColumns = extractGroupByNames(aggregation.projection)

        const projectionFunctions = extractProjectionFunctionsObjects(aggregation.projection)

        const { filterColumnsStr }  = this.createFieldsStatementAndAliases(projectionFunctions, groupByColumns)

        const havingFilter = this.parseFilter(aggregation.postFilter)

        const { filterExpr, parameters } = this.extractFilterExprAndParams(havingFilter)


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
            filterColumnsStr.push(`CAST(${this.adapterFunction2Sql(f.function)}(${escapeIdentifier(f.name)}) AS FLOAT64) AS ${escapeIdentifier(f.alias)}`)
            aliasToFunction[f.alias] = `${this.adapterFunction2Sql(f.function)}(${escapeIdentifier(f.name)})`
        })

        return { filterColumnsStr, aliasToFunction }
    }

    extractFilterExprAndParams(havingFilter) {
        return havingFilter.map(({ filterExpr, parameters }) => ({ filterExpr: filterExpr !== '' ? `HAVING ${filterExpr}` : '',
                                                                    parameters: parameters }))
                           .concat(EmptyFilter)[0]
    }

    parseFilter(filter) {
        if (isEmptyFilter(filter)) {
            return []
        }

        const { operator, fieldName, value } = filter

        switch (operator) {
            case and:
            case or:
                const res = value.map( this.parseFilter.bind(this) )
                const op = operator === and ? ' AND ' : ' OR '
                return [{
                    filterExpr: res.map(r => r[0].filterExpr).join( op ),
                    parameters: res.map( s => s[0].parameters ).flat()
                }]
            case not:
                const res2 = this.parseFilter( value[0] )
                return [{
                    filterExpr: `NOT (${res2[0].filterExpr})`,
                    parameters: res2[0].parameters
                }]
        }

        if (this.isSingleFieldOperator(operator)) {
            return [{
                filterExpr: `${escapeIdentifier(fieldName)} ${this.adapterOperatorToMySqlOperator(operator, value)} ${this.valueForOperator(value, operator)}`.trim(),
                parameters: !isNull(value) ? [].concat( this.patchTrueFalseValue(value) ) : []
            }]
        }

        if (this.isSingleFieldStringOperator(operator)) {
            return [{
                filterExpr: `LOWER(${escapeIdentifier(fieldName)}) LIKE LOWER(?)`,
                parameters: [this.valueForStringOperator(operator, value)]
            }]
        }

        if (operator === urlized) {
            return [{
                filterExpr: `LOWER(${escapeIdentifier(fieldName)}) RLIKE ?`,
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

    valueForOperator(value, operator) {
        if (operator === include) {
            if (isNull(value) || value.length === 0) {
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
            }
            return `(${wildCardWith(value.length, '?')})`
        } else if ((operator === eq || operator === ne) && isNull(value)) {
            return ''
        }

        return '?'
    }

    adapterOperatorToMySqlOperator(operator, value) {
        switch (operator) {
            case eq:
                if (!isNull(value)) {
                    return '='
                }
                return 'IS NULL'
            case ne:
                if (!isNull(value)) {
                    return '<>'
                }
                return 'IS NOT NULL'
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
            return EmptySort
        }

        const results = sort.flatMap( this.parseSort )

        if (results.length === 0) {
            return EmptySort
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

    selectFieldsFor(projection) { 
        return projection.map(escapeIdentifier).join(', ')
    }
}

module.exports = FilterParser