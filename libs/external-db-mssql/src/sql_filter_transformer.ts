import { EmptyFilter, EmptySort, isObject, AdapterOperators, extractProjectionFunctionsObjects, extractGroupByNames, isEmptyFilter, isNull, specArrayToRegex, errors } from '@wix-velo/velo-external-db-commons'
import { AdapterFilter as Filter, NonEmptyAdapterAggregation as Aggregation, AdapterOperator, Sort, FunctionProjection, NotEmptyAdapterFilter as NotEmptyFilter, AdapterFunctions } from '@wix-velo/velo-external-db-types'
import { escapeId, validateLiteralWithCounter, patchFieldNameWithCounter } from './mssql_utils'
import { MSSQLParsedFilter } from './types'
const { InvalidQuery } = errors
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized, matches } = AdapterOperators
const { avg, max, min, sum, count } = AdapterFunctions

export type Counter = {
    paramCounter: number,
    valueCounter: number
}

export default class FilterParser {
    constructor() {
    }

    transform(filter: Filter) {
        const counter = { paramCounter: 0, valueCounter: 0 }
        const results = this.parseFilter(filter, counter, 1)

        if (results.length === 0) {
            return EmptyFilter
        }

        return {
            filterExpr: `WHERE ${results[0].filterExpr}`,
            parameters: results[0].parameters
        }
    }

    adapterFunction2Sql(f: any) {
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

        const { filterColumnsStr, aliasToFunction }  = this.createFieldsStatementAndAliases(projectionFunctions, groupByColumns)

        const havingFilter = this.parseFilter(aggregation.postFilter || {}, undefined, aliasToFunction)

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
        groupByColumns.forEach((f: any) => filterColumnsStr.push(escapeId(f)))
        projectionFunctions.forEach((f: FunctionProjection) => { 
            filterColumnsStr.push(`${this.adapterFunction2Sql(f.function)}(${escapeId(f.name)}) AS ${escapeId(f.alias)}`)
            aliasToFunction[f.alias] = `${this.adapterFunction2Sql(f.function)}(${escapeId(f.name)})`
        })

        return { filterColumnsStr, aliasToFunction }
    }

    extractFilterExprAndParams(havingFilter: { filterExpr: any; parameters: any }[]) {
        return havingFilter.map(({ filterExpr, parameters }) => ({ filterExpr: filterExpr !== '' ? `HAVING ${filterExpr}` : '', parameters }))
                        .concat({ filterExpr: '', parameters: {} })[0]
    }

    parseFilter(filter: Filter, counter: Counter = { paramCounter: 0, valueCounter: 0 }, inlineFields?: any): MSSQLParsedFilter[] {

        if (isEmptyFilter(filter)) {
            return []
        }

        const { operator, fieldName, value } =  filter as NotEmptyFilter

        switch (operator) {
            case and:
            case or:
                const res = value.reduce((o: { filter: MSSQLParsedFilter[] }, f: any) => {
                    const res = this.parseFilter.bind(this)(f, counter, inlineFields)
                    return {
                        filter: o.filter.concat( ...res ),
                    }
                }, { filter: [] })
                const op = operator === and ? ' AND ' : ' OR '
                return [{
                    filterExpr: `(${res.filter.map((r: { filterExpr: any }) => r.filterExpr).join( op )})`,
                    parameters: res.filter.reduce((o: any, s: { parameters: any }) => ( { ...o, ...s.parameters } ), {} )
                }]
            case not:
                const res2 = this.parseFilter( value[0], counter, inlineFields )
                return [{
                    filterExpr: `NOT (${res2[0].filterExpr})`,
                    parameters: res2[0].parameters
                }]
        }

        if (this.isSingleFieldOperator(operator)) {
            const literals = this.valueForOperator(fieldName, value, operator, counter).sql

            return [{
                filterExpr: `${this.inlineVariableIfNeeded(fieldName, inlineFields)} ${this.adapterOperatorToMySqlOperator(operator, value)} ${literals}`.trim(),
                parameters: this.parametersFor(fieldName, value, counter)
            }]
        }


        if (this.isSingleFieldStringOperator(operator)) {
            const literals = this.valueForOperator(fieldName, value, operator, counter).sql

            return [{
                filterExpr: `${this.inlineVariableIfNeeded(fieldName, inlineFields)} LIKE ${literals}`.trim(),
                parameters: this.parametersFor(fieldName, this.valueForStringOperator(operator, value), counter)
            }]
        }

        if (operator === urlized) {
            const literals = this.valueForOperator(fieldName, value, operator, counter).sql

            return [{
                filterExpr: `LOWER(${escapeId(fieldName)}) LIKE ${literals}`,
                parameters: this.parametersFor(fieldName, value.map((s:string) => s.toLocaleLowerCase()).join('[- ]'), counter)
            }]
        }

        
        if (operator === matches) {
            const ignoreCase = value.ignoreCase ? 'LOWER' : ''
            const literals = this.valueForOperator(fieldName, value, operator, counter).sql
            return [{
                filterExpr: `${ignoreCase}(${escapeId(fieldName)}) LIKE ${ignoreCase}(${literals})`,
                parameters: this.parametersFor(fieldName, specArrayToRegex(value.spec), counter)
            }]
        }

        return []
    }

    parametersFor(name: string, value: any, counter: {paramCounter: number, valueCounter: number}) {
        if (!isNull(value)) {
            if (!Array.isArray(value)) {
                return { [patchFieldNameWithCounter(name, counter)]: this.patchTrueFalseValue(value) }
            } else {
                return value.reduce((o, v) => ( { ...o, [patchFieldNameWithCounter(name, counter)]: v } ), {})
            }
        }
        return { }
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

    prepareStatementVariables(n: any, fieldName: any, counter: Counter) {
        return Array.from({ length: n }, (_, _i) => validateLiteralWithCounter(fieldName, counter) )
                    .join(', ')
    }


    valueForOperator(fieldName: any, value: string | any[], operator: string, counter: Counter) {
        if (operator === include) {
            if (isNull(value) || value.length === 0) {
                throw new InvalidQuery('$hasSome cannot have an empty list of arguments')
            }
            return {
                sql: `(${this.prepareStatementVariables(value.length, fieldName, counter)})`,
            }
        } else if ((operator === eq || operator === ne) && isNull(value)) {
            return {
                sql: '',
            }
        }

        return {
            sql: validateLiteralWithCounter(fieldName, counter),
        }
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

    orderBy(sort: any) {
        if (!Array.isArray(sort) || !sort.every(isObject)) {
            return EmptySort
        }
        //todo: add a function that ensure the sort is valid
        const results = sort.flatMap( this.parseSort )

        if (results.length === 0) {
            return EmptySort
        }

        return {
            sortExpr: `ORDER BY ${results.map((s: {expr: string}) => s.expr).join(', ')}`
        }
    }

    parseSort({ fieldName, direction }: Sort): { expr: string }[] {
        if (typeof fieldName !== 'string') {
            return []
        }
        const _direction = direction || 'ASC'

        const dir = 'ASC' === _direction.toUpperCase() ? 'ASC' : 'DESC'

        return [{
            expr: `${escapeId(fieldName)} ${dir}`
        }]
    }

    patchTrueFalseValue(value: boolean) {
        if (value === true || value === false) {
            return value ? 1 : 0
        }
        return value
    }

    inlineVariableIfNeeded(fieldName: string, inlineFields: { [x: string]: any }) {
        if (inlineFields) {
            if (inlineFields[fieldName]) {
                return inlineFields[fieldName]
            }
        }
        return escapeId(fieldName)
    }

    selectFieldsFor(projection: any[]) {
        return projection.map(escapeId).join(', ')
    }
}
