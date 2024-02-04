import { errors, isDate } from '@wix-velo/velo-external-db-commons'
import { AdapterFilter as Filter, NonEmptyAdapterAggregation as Aggregation, AdapterOperator, Sort, NotEmptyAdapterFilter as NotEmptyFilter, AdapterFunctions } from '@wix-velo/velo-external-db-types'
import { EmptyFilter, EmptySort, isObject, AdapterOperators, extractGroupByNames, extractProjectionFunctionsObjects, isEmptyFilter, isNull, specArrayToRegex } from '@wix-velo/velo-external-db-commons'
import { wildCardWith, escapeId } from './mysql_utils'
import { MySqlParsedFilter, MySqlParsedAggregation } from './types'
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized, matches } = AdapterOperators
const { InvalidQuery } = errors
const { avg, max, min, sum, count } = AdapterFunctions

export interface IMySqlFilterParser {
    transform(filter: Filter): MySqlParsedFilter
    orderBy(sort: any): { sortExpr: string }
    selectFieldsFor(projection: any[]): string
    parseAggregation(aggregation: Aggregation): MySqlParsedAggregation
}

export default class FilterParser implements IMySqlFilterParser {
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

    parseFilter(filter: Filter) : MySqlParsedFilter[] {
        if (isEmptyFilter(filter)) {
            return []
        }

        const { operator, fieldName, value } = filter as NotEmptyFilter

        switch (operator) {
            case and:
            case or:
                const res = value.map( this.parseFilter.bind(this) )
                const op = operator === AdapterOperators.and ? ' AND ' : ' OR '
                return [{
                    filterExpr: `(${res.map((r: { filterExpr: any }[]) => r[0].filterExpr).join( op )})`,
                    parameters: res.map( (s: { parameters: any }[]) => s[0].parameters ).flat()
                }]
            case not:
                const res2 = this.parseFilter( value[0] )
                return [{
                    filterExpr: `NOT (${res2[0].filterExpr})`,
                    parameters: res2[0].parameters
                }]
        }

        if (this.isNestedField(fieldName)) {
            const [nestedFieldName, ...nestedFieldPath] = fieldName.split('.')
            
            return [{
                filterExpr: `${escapeId(nestedFieldName)} ->> '$.${nestedFieldPath.join('.')}' ${this.adapterOperatorToMySqlOperator(operator, value)} ${this.valueForOperator(value, operator)}`.trim(),
                parameters: !isNull(value) ? [].concat( this.patchTrueFalseValue(value) ) : []
            }]          
        }
        
        if (operator === urlized) {
            return [{
                filterExpr: `LOWER(${escapeId(fieldName)}) RLIKE ?`,
                parameters: [value.map((s: string) => s.toLowerCase()).join('[- ]')]
            }]
        }
        
        if (operator === matches) {
            const ignoreCase = value.ignoreCase ? 'LOWER' : ''
            return [{
                filterExpr: `${ignoreCase}(${escapeId(fieldName)}) RLIKE ${ignoreCase}(?)`,
                parameters: [specArrayToRegex(value.spec)]
            }]
        }

        if (operator === eq && isObject(value) && !isDate(value)) {
            return [{
                filterExpr: `JSON_CONTAINS(${escapeId(fieldName)}, ?)`,
                parameters: [JSON.stringify(value)]
            }]
        }

        if (this.isSingleFieldOperator(operator)) {
            return [{
                filterExpr: `${escapeId(fieldName)} ${this.adapterOperatorToMySqlOperator(operator, value)} ${this.valueForOperator(value, operator)}`.trim(),
                parameters: !isNull(value) ? [].concat( this.patchTrueFalseValue(value) ) : []
            }]
        }

        if (this.isSingleFieldStringOperator(operator)) {
            return [{
                filterExpr: `${escapeId(fieldName)} LIKE ?`,
                parameters: [this.valueForStringOperator(operator, value)]
            }]
        }
        
        return []
    }

    isSingleFieldOperator(operator: any) {
        return [ne, lt, lte, gt, gte, include, eq].includes(operator)
    }

    isSingleFieldStringOperator(operator: any) {
        return [string_contains, string_begins, string_ends].includes(operator)
    }

    isNestedField(fieldName: string) {
        return fieldName.includes('.')
    }

    valueForOperator(value: string | any[], operator: any) {
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


    adapterOperatorToMySqlOperator(operator: AdapterOperator, value: any) {
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

    orderBy(sort: Sort[]) {
        if (!Array.isArray(sort) || !sort.every(isObject)) {
            return EmptySort
        }

        const results = sort.flatMap( this.parseSort )

        if (results.length === 0) {
            return EmptySort
        }

        return {
            sortExpr: `ORDER BY ${results.map( (s: { expr: string }) => s.expr).join(', ')}`
        }
    }

    valueForStringOperator(operator: AdapterOperator, value: string) {
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

    parseSort({ fieldName, direction }: Sort): { expr: string }[] {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'ASC'

        const dir = 'ASC' === _direction.toUpperCase() ? 'ASC' : 'DESC'

        return [{
            expr: `${escapeId(fieldName)} ${dir}`,
        }]
    }

    patchTrueFalseValue(value: any ): any {
        if (value === true || value === false) {
            return value ? 1 : 0
        }
        return value
    }

    parseAggregation(aggregation: Aggregation) {

        const groupByColumns = extractGroupByNames(aggregation.projection)
        
        const projectionFunctions = extractProjectionFunctionsObjects(aggregation.projection)

        const filterColumnsStr = this.createFieldsStatementArray(projectionFunctions, groupByColumns)

        const havingFilter = this.parseFilter(aggregation.postFilter)

        const { filterExpr, parameters } = this.extractFilterExprAndParams(havingFilter)

        return {
            fieldsStatement: filterColumnsStr.join(', '),
            groupByColumns,
            havingFilter: filterExpr,
            parameters,
        }
    }

    createFieldsStatementArray(projectionFunctions: any[], groupByColumns: any[]) {
        const filterColumnsStr: string[] = []
        groupByColumns.forEach((f: any) => filterColumnsStr.push(escapeId(f)))
        projectionFunctions.forEach((f: { function: any; name: any; alias: any }) => filterColumnsStr.push(`${this.adapterFunction2Sql(f.function)}(${escapeId(f.name)}) AS ${escapeId(f.alias)}`))
        return filterColumnsStr
    }

    extractFilterExprAndParams(havingFilter: { filterExpr: any; parameters: any }[]) {
        return havingFilter.map(({ filterExpr, parameters }) => ({ filterExpr: filterExpr !== '' ? `HAVING ${filterExpr}` : '', parameters }))
                           .concat(EmptyFilter)[0]
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

    selectFieldsFor(projection: string[]) {
        return projection.map(escapeId).join(', ')
    }
}
