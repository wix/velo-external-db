import { AdapterFilter as Filter, NonEmptyAdapterAggregation as Aggregation, AdapterOperator, Sort, NotEmptyAdapterFilter, AdapterFunctions } from '@wix-velo/velo-external-db-types'
import { EmptyFilter, EmptySort, isObject, isEmptyFilter, AdapterOperators, extractGroupByNames, extractProjectionFunctionsObjects, isNull, specArrayToRegex } from '@wix-velo/velo-external-db-commons'
import { errors } from '@wix-velo/velo-external-db-commons'
import { escapeIdentifier } from './bigquery_utils'
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized, matches } = AdapterOperators
const { avg, max, min, sum, count } = AdapterFunctions
const { InvalidQuery } = errors

export default class FilterParser {
    constructor() {
    }

    transform(filter: Filter) {
        const results = this.parseFilter(filter)

        if (results.length === 0) {
            return EmptyFilter
        }

        return {
            filterExpr: `WHERE ${results[0].filterExpr}`,
            parameters: results[0].parameters
        }
    }

    adapterFunction2Sql(f: string) {
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

    parseAggregation(aggregation: Aggregation) {
        
        const groupByColumns = extractGroupByNames(aggregation.projection)

        const projectionFunctions = extractProjectionFunctionsObjects(aggregation.projection)

        const { filterColumnsStr }  = this.createFieldsStatementAndAliases(projectionFunctions, groupByColumns)

        const havingFilter = this.parseFilter(aggregation.postFilter)

        const { filterExpr, parameters } = this.extractFilterExprAndParams(havingFilter)


        return {
            fieldsStatement: filterColumnsStr.join(', '),
            groupByColumns,
            havingFilter: filterExpr,
            parameters,
        }
    }

    createFieldsStatementAndAliases(projectionFunctions: any[], groupByColumns: any[]) {
        const filterColumnsStr: string[] = []
        const aliasToFunction: {[x: string]: string} = {}
        groupByColumns.forEach(f => filterColumnsStr.push(escapeIdentifier(f)))
        projectionFunctions.forEach(f => { 
            filterColumnsStr.push(`CAST(${this.adapterFunction2Sql(f.function)}(${escapeIdentifier(f.name)}) AS FLOAT64) AS ${escapeIdentifier(f.alias)}`)
            aliasToFunction[f.alias] = `${this.adapterFunction2Sql(f.function)}(${escapeIdentifier(f.name)})`
        })

        return { filterColumnsStr, aliasToFunction }
    }

    extractFilterExprAndParams(havingFilter: any[]) {
        return havingFilter.map(({ filterExpr, parameters }) => ({ filterExpr: filterExpr !== '' ? `HAVING ${filterExpr}` : '', parameters }))
                           .concat(EmptyFilter)[0]
    }

    parseFilter(filter: Filter) {
        if (isEmptyFilter(filter)) {
            return []
        }

        const { operator, fieldName, value } = filter as NotEmptyAdapterFilter

        switch (operator) {
            case and:
            case or:
                const res: any = (value as NotEmptyAdapterFilter[]).map( this.parseFilter.bind(this)) 
                const op = operator === and ? ' AND ' : ' OR '
                return [{
                    filterExpr: `(${res.map( (r: any) => r[0].filterExpr).join( op )})`,
                    parameters: res.map( (s: any) => s[0].parameters ).flat()
                }]
            case not:
                const res2: any = this.parseFilter( value[0] )
                return [{
                    filterExpr: `NOT (${res2[0].filterExpr})`,
                    parameters: res2[0].parameters
                }]
        }

        if (this.isNestedField(fieldName)) {            
            return [{
                filterExpr: `JSON_VALUE(${(fieldName)}) ${this.adapterOperatorToMySqlOperator(operator, value)} ${this.valueForOperator(value, operator)}`.trim(),
                parameters: !isNull(value) ? [this.patchTrueFalseValue(value)] : []
            }]      
        }

        if (this.isSingleFieldOperator(operator)) {
            return [{
                filterExpr: `${escapeIdentifier(fieldName)} ${this.adapterOperatorToMySqlOperator(operator, value)} ${this.valueForOperator(value, operator)}`.trim(),
                parameters: !isNull(value) ? [this.patchTrueFalseValue(value)] : []
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
                parameters: [value.map((s: string) => s.toLowerCase()).join('[- ]')]
            }]
        }

        if (operator === matches) {
            const ignoreCase = value.ignoreCase ? 'LOWER' : ''
            return [{
                filterExpr: `REGEXP_CONTAINS(${ignoreCase}(${escapeIdentifier(fieldName)}), ${ignoreCase}(?))`,
                parameters: [specArrayToRegex(value.spec)]
            }]
        }

        return []
    }

    valueForStringOperator(operator: AdapterOperator, value: any) {
        switch (operator) {
            case string_contains:
                return `%${value}%`
            case string_begins:
                return `${value}%`
            case string_ends:
                return `%${value}`
            default:
                return value
        }
    }

    isSingleFieldOperator(operator: string) {
        return [ne, lt, lte, gt, gte, include, eq].includes(operator)
    }

    isSingleFieldStringOperator(operator: string) {
        return [string_contains, string_begins, string_ends].includes(operator)
    }

    isNestedField(fieldName: string) {
        return fieldName.includes('.')
    }

    valueForOperator(value: any, operator: string) {
        if (operator === include) {
            if (isNull(value) || value.length === 0) {
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
            }
            return 'UNNEST(?)'
        } else if ((operator === eq || operator === ne) && isNull(value)) {
            return ''
        }

        return '?'
    }

    adapterOperatorToMySqlOperator(operator: string, value: any) {
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
            default:
                return ''
        }
    }

    orderBy(sort: any) {
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

    parseSort({ fieldName, direction }: Sort): { expr: string }[] {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'ASC'

        const dir = 'ASC' === _direction.toUpperCase() ? 'ASC' : 'DESC'

        return [{
            expr: `${escapeIdentifier(fieldName)} ${dir}`,
        }]
    }

    patchTrueFalseValue(value: boolean) {
        if (value === true || value === false) {
            return value ? 1 : 0
        }
        return value
    }

    selectFieldsFor(projection: string[]) {
        return projection.map(escapeIdentifier).join(', ')
    }
}
