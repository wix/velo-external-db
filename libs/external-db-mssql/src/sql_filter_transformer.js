const { InvalidQuery } = require('@wix-velo/velo-external-db-commons').errors
const { EmptyFilter, EmptySort, isObject, AdapterOperators, AdapterFunctions, extractProjectionFunctionsObjects, extractGroupByNames, isEmptyFilter, isNull, specArrayToRegex } = require('@wix-velo/velo-external-db-commons')
const { escapeId, validateLiteral, patchFieldName } = require('./mssql_utils')
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized, matches } = AdapterOperators
const { avg, max, min, sum, count } = AdapterFunctions

class FilterParser {
    constructor() {
    }

    transform(filter) {
        const results = this.parseFilter(filter, 1, {})

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

        const { filterColumnsStr, aliasToFunction }  = this.createFieldsStatementAndAliases(projectionFunctions, groupByColumns)

        const havingFilter = this.parseFilter(aggregation.postFilter, aliasToFunction)

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
        groupByColumns.forEach(f => filterColumnsStr.push(escapeId(f)))
        projectionFunctions.forEach(f => { 
            filterColumnsStr.push(`${this.adapterFunction2Sql(f.function)}(${escapeId(f.name)}) AS ${escapeId(f.alias)}`)
            aliasToFunction[f.alias] = `${this.adapterFunction2Sql(f.function)}(${escapeId(f.name)})`
        })

        return { filterColumnsStr, aliasToFunction }
    }

    extractFilterExprAndParams(havingFilter) {
        return havingFilter.map(({ filterExpr, parameters }) => ({ filterExpr: filterExpr !== '' ? `HAVING ${filterExpr}` : '',
                                                              parameters: parameters }))
                        .concat({ filterExpr: '', parameters: {} })[0]
    }

    parseFilter(filter, inlineFields) {
        if (isEmptyFilter(filter)) {
            return []
        }

        const { operator, fieldName, value } =  filter

        switch (operator) {
            case and:
            case or:
                const res = value.reduce((o, f) => {
                    const res = this.parseFilter.bind(this)(f, inlineFields)
                    return {
                        filter: o.filter.concat( ...res ),
                    }
                }, { filter: [] })
                const op = operator === and ? ' AND ' : ' OR '
                return [{
                    filterExpr: res.filter.map(r => r.filterExpr).join( op ),
                    parameters: res.filter.reduce((o, s) => ( { ...o, ...s.parameters } ), {} )
                }]
            case not:
                const res2 = this.parseFilter( value[0], inlineFields )
                return [{
                    filterExpr: `NOT (${res2[0].filterExpr})`,
                    parameters: res2[0].parameters
                }]
        }

        if (this.isSingleFieldOperator(operator)) {
            const params = this.valueForOperator(fieldName, value, operator)

            return [{
                filterExpr: `${this.inlineVariableIfNeeded(fieldName, inlineFields)} ${this.adapterOperatorToMySqlOperator(operator, value)} ${params.sql}`.trim(),
                parameters: this.parametersFor(fieldName, value)
            }]
        }


        if (this.isSingleFieldStringOperator(operator)) {
            return [{
                filterExpr: `${this.inlineVariableIfNeeded(fieldName, inlineFields)} LIKE ${validateLiteral(fieldName)}`,
                parameters: { [patchFieldName(fieldName)]: this.valueForStringOperator(operator, value) }
            }]
        }

        if (operator === urlized) {
            return [{
                filterExpr: `LOWER(${escapeId(fieldName)}) LIKE ${validateLiteral(fieldName)}`,
                parameters: { [patchFieldName(fieldName)]: value.map(s => s.toLowerCase()).join('[- ]') }
            }]
        }

        if (operator === matches) {
            const ignoreCase = value.ignoreCase ? 'LOWER' : ''
            return [{
                filterExpr: `${ignoreCase}(${escapeId(fieldName)}) LIKE ${ignoreCase}(${validateLiteral(fieldName)})`,
                parameters: { [patchFieldName(fieldName)]: specArrayToRegex(value.spec) }
            }]
        }

        return []
    }

    parametersFor(name, value) {
        if (!isNull(value)) {
            if (!Array.isArray(value)) {
                return { [patchFieldName(name)]: this.patchTrueFalseValue(value) }
            } else {
                return value.reduce((o, v, i) => ( { ...o, [patchFieldName(`${name}${i + 1}`)]: v } ), {})
            }
        }
        return { }
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

    prepareStatementVariables(n, fieldName) {
        return Array.from({ length: n }, (_, i) => validateLiteral(`${fieldName}${i + 1}`) )
                    .join(', ')
    }


    valueForOperator(fieldName, value, operator) {
        if (operator === include) {
            if (isNull(value) || value.length === 0) {
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
            }
            return {
                sql: `(${this.prepareStatementVariables(value.length, fieldName)})`,
            }
        } else if ((operator === eq || operator === ne) && isNull(value)) {
            return {
                sql: '',
            }
        }

        return {
            sql: validateLiteral(fieldName),
        }
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
            expr: `${escapeId(fieldName)} ${dir}`
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
        return escapeId(fieldName)
    }

    selectFieldsFor(projection) {
        return projection.map(escapeId).join(', ')
    }
}

module.exports = FilterParser