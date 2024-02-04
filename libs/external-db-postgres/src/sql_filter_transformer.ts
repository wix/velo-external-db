import { NonEmptyAdapterAggregation as Aggregation, AdapterFilter as Filter, AnyFixMe, NotEmptyAdapterFilter as NotEmptyFilter, Sort, AdapterFunctions } from '@wix-velo/velo-external-db-types' 
import { errors, isDate } from '@wix-velo/velo-external-db-commons'
import { EmptyFilter, EmptySort, isObject, AdapterOperators, extractProjectionFunctionsObjects, extractGroupByNames, isEmptyFilter, isNull, specArrayToRegex } from '@wix-velo/velo-external-db-commons'
import { escapeIdentifier } from './postgres_utils'
import { ParsedFilter } from './types'
const { InvalidQuery } = errors
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, matches } = AdapterOperators
const { avg, max, min, sum, count } = AdapterFunctions



export default class FilterParser {
    public constructor() {
    }

    transform(filter: Filter) {
        const results = this.parseFilter(filter, 1, {})
        
        if (results.length === 0) {
            return EmptyFilter
        }

        return {
            filterExpr: `WHERE ${results[0].filterExpr}`,
            filterColumns: results[0].filterColumns,
            offset: results[0].offset,
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

    parseAggregation(aggregation: Aggregation, offset: number) {

        const groupByColumns = extractGroupByNames(aggregation.projection)
        
        const projectionFunctions = extractProjectionFunctionsObjects(aggregation.projection)

        const { filterColumnsStr, aliasToFunction }  = this.createFieldsStatementAndAliases(projectionFunctions, groupByColumns)

        const havingFilter = this.parseFilter(aggregation.postFilter, offset, aliasToFunction)

        const { filterExpr, parameters, offset: offsetAfterAggregation } = this.extractFilterExprAndParams(havingFilter, offset)


        return {
            fieldsStatement: filterColumnsStr.join(', '),
            groupByColumns,
            havingFilter: filterExpr,
            parameters,
            offset: offsetAfterAggregation
        }
    }

    createFieldsStatementAndAliases(projectionFunctions: AnyFixMe, groupByColumns: AnyFixMe) {
        const filterColumnsStr: AnyFixMe = []
        const aliasToFunction: { [key: string]: any } = {}
        groupByColumns.forEach((f: any) => filterColumnsStr.push(escapeIdentifier(f)))
        projectionFunctions.forEach((f: any) => { 
            filterColumnsStr.push(`${this.adapterFunction2Sql(f.function)}(${escapeIdentifier(f.name)}) AS ${escapeIdentifier(f.alias)}`)
            aliasToFunction[f.alias] = `${this.adapterFunction2Sql(f.function)}(${escapeIdentifier(f.name)})`
        })

        return { filterColumnsStr, aliasToFunction }
    }

    extractFilterExprAndParams(havingFilter: any[], offset: number) {
        return havingFilter.map(({ filterExpr, parameters, offset }) => ({ filterExpr: filterExpr !== '' ? `HAVING ${filterExpr}` : '', parameters, offset }))
                           .concat({ ...EmptyFilter, offset: offset ?? 1 })[0]
    }

    parseFilter(filter: Filter, offset: number, inlineFields: { [key: string]: any }) : ParsedFilter[] {

        if (isEmptyFilter(filter)) {
            return []
        }
        
        const { operator, fieldName, value } = filter as NotEmptyFilter
        
        switch (operator) {
            case and:
            case or:
                const res: { filter: ParsedFilter[], offset: number } = value.reduce((o: { filter: Filter[], offset: number}, f: Filter) => {
                    const res = this.parseFilter.bind(this)(f, o.offset, inlineFields)
                    return {
                        filter: [ ...o.filter, ...res],
                        offset: res.length === 1 ? res[0].offset : o.offset
                    }
                }, { filter: [], offset })

                const op = operator === and ? ' AND ' : ' OR '
                return [{
                    filterExpr: `(${res.filter.map((r: ParsedFilter) => r.filterExpr).join(op)})`,
                    filterColumns: [],
                    offset: res.offset,
                    parameters: res.filter.map((s: ParsedFilter) => s.parameters).flat()
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

        if (this.isNestedField(fieldName)) {
            const [nestedFieldName, ...nestedFieldPath] = fieldName.split('.')
            const params = this.valueForOperator(value, operator, offset)
            return [{
                filterExpr: `${escapeIdentifier(nestedFieldName)} ->> '${nestedFieldPath.join('.')}' ${this.adapterOperatorToMySqlOperator(operator, value)} ${params.sql}`.trim(),
                parameters: !isNull(value) ? [].concat( this.patchTrueFalseValue(value) ) : [],
                offset: params.offset,
                filterColumns: [],
            }]
        }

        if (operator === matches) {
            const ignoreCase = value.ignoreCase ? 'LOWER' : ''
            return [{
                filterExpr: `${ignoreCase}(${escapeIdentifier(fieldName)}) ~ ${ignoreCase}($${offset})`,
                filterColumns: [],
                offset: offset + 1,
                parameters: [specArrayToRegex(value.spec)]
            }]
        }

        if (operator === eq && isObject(value) && !isDate(value)) {
            return [{
                filterExpr: `${escapeIdentifier(fieldName)}::jsonb @> $${offset}::jsonb`,
                filterColumns: [],
                offset: offset + 1,
                parameters: [JSON.stringify(value)]
            }]
        }

        if (this.isSingleFieldOperator(operator)) {
            const params = this.valueForOperator(value, operator, offset)

            return [{
                filterExpr: `${this.inlineVariableIfNeeded(fieldName, inlineFields)} ${this.adapterOperatorToMySqlOperator(operator, value)} ${params.sql}`.trim(),
                filterColumns: [],
                offset: params.offset,
                parameters: !isNull(value) ? [].concat( this.patchTrueFalseValue(value) ) : []
            }]
        }


        if (this.isSingleFieldStringOperator(operator)) {
            return [{
                filterExpr: `${this.inlineVariableIfNeeded(fieldName, inlineFields)} ILIKE $${offset}`,
                filterColumns: [],
                offset: offset + 1,
                parameters: [this.valueForStringOperator(operator, value)]
            }]
        }

        return []
    }

    isNestedField(fieldName: string) {
        return fieldName.includes('.')
    }

    valueForStringOperator(operator: string, value: any) {
        switch (operator) {
            case string_contains:
                return `%${value}%`
            case string_begins:
                return `${value}%`
            case string_ends:
                return `%${value}`
        }

        return 
    }

    isSingleFieldOperator(operator: string) {
        return [ne, lt, lte, gt, gte, include, eq].includes(operator)
    }

    isSingleFieldStringOperator(operator: string) {
        return [string_contains, string_begins, string_ends].includes(operator)
    }

    prepareStatementVariables(n: number, offset: number) {
        return Array.from({ length: n }, (_, i) => `$${offset + i}`)
                    .join(', ')
    }


    valueForOperator(value: string | string[], operator: string, offset: number) {
        if (operator === include) {
            if (value === undefined || value.length === 0) {
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
            }
            return {
                sql: `(${this.prepareStatementVariables(value.length, offset)})`,
                offset: offset + value.length
            }
        } else if ((operator === eq || operator === ne) && isNull(value)) {
            return {
                sql: '',
                offset
            }
        }

        return {
            sql: `$${offset}`,
            offset: offset + 1
        }
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
        }

        return 
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
            sortExpr: `ORDER BY ${results.map( s => s.expr).join(', ')}`
        }
    }

    parseSort({ fieldName, direction }: Sort) {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'ASC'

        const dir = 'ASC' === _direction.toUpperCase() ? 'ASC' : 'DESC'

        return [{
            expr: `${escapeIdentifier(fieldName)} ${dir}`
        }]
    }

    selectFieldsFor(projection: string[]) {
        return projection.map(escapeIdentifier).join(', ')
    }

    patchTrueFalseValue(value: any) {
        if (value === true || value === false) {
            return value ? 1 : 0
        }
        return value
    }

    inlineVariableIfNeeded(fieldName: string, inlineFields: { [key: string]: any }) {
        if (inlineFields) {
            if (inlineFields[fieldName]) {
                return inlineFields[fieldName]
            }
        }
        return escapeIdentifier(fieldName)
    }

}

