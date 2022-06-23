import { errors } from '@wix-velo/velo-external-db-commons'
import { EmptyFilter, EmptySort, isObject, AdapterOperators, AdapterFunctions, isEmptyFilter, extractGroupByNames, extractProjectionFunctionsObjects, isNull, specArrayToRegex } from '@wix-velo/velo-external-db-commons'
import { escapeId, validateLiteral, patchFieldName, escapeFieldId } from './spanner_utils'
import { AdapterFilter as Filter, AdapterAggregation as Aggregation, Item, AdapterOperator, Sort, FunctionProjection, FieldProjection, NotEmptyAdapterFilter as NotEmptyFilter} from '@wix-velo/velo-external-db-types'
import { SpannerParsedAggregation, SpannerParsedFilter } from './types'
const { InvalidQuery } = errors
const { eq, gt, gte, include, lt, lte, ne, string_begins, string_ends, string_contains, and, or, not, urlized, matches } = AdapterOperators
const { avg, max, min, sum, count } = AdapterFunctions

export interface ISpannerFilterParser{
    transform(filter: Filter): SpannerParsedFilter
    orderBy(sort: any): { sortExpr: string }
    selectFieldsFor(projection: any[]): string
    parseAggregation(aggregation: Aggregation): SpannerParsedAggregation
}

export default class FilterParser implements ISpannerFilterParser {
    constructor() {
    }

    transform(filter: Filter) {
        const results = this.parseFilter(filter, 1)

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

        const groupByColumns = extractGroupByNames(aggregation.projection).map(patchFieldName)

        const projectionFunctions = extractProjectionFunctionsObjects(aggregation.projection)

        const { filterColumnsStr, aliasToFunction } = this.createFieldsStatementAndAliases(projectionFunctions, groupByColumns)

        const havingFilter = this.parseFilter(aggregation.postFilter, aliasToFunction)

        const { filterExpr, parameters } = this.extractFilterExprAndParams(havingFilter)

        return {
            fieldsStatement: filterColumnsStr.join(', '),
            groupByColumns,
            havingFilter: filterExpr,
            parameters: parameters,
        }
    }

    createFieldsStatementAndAliases(projectionFunctions: FunctionProjection[], groupByColumns: string[]) {
        const filterColumnsStr: string[] = []
        const aliasToFunction: {[x:string]: string} = {}
        groupByColumns.forEach((f: string) => filterColumnsStr.push(escapeFieldId(f)))
        projectionFunctions.forEach((f: FunctionProjection) => { 
            filterColumnsStr.push(`${this.adapterFunction2Sql(f.function)}(${escapeFieldId(f.name)}) AS ${escapeFieldId(f.alias)}`)
            aliasToFunction[f.alias] = `${this.adapterFunction2Sql(f.function)}(${escapeFieldId(f.name)})`
        })

        return { filterColumnsStr, aliasToFunction }
    }

    extractFilterExprAndParams(havingFilter: SpannerParsedFilter[]) {
        // @ts-ignore - concat
        return havingFilter.map(({ filterExpr, parameters }: SpannerParsedFilter) => ({ filterExpr: filterExpr !== '' ? `HAVING ${filterExpr}` : '',
                                                            parameters: parameters }))
                    .concat({ filterExpr: '', parameters: {} })[0]
    }

    parseFilter(filter: Filter | {}, inlineFields: any): SpannerParsedFilter[]{
        if (isEmptyFilter(filter)) {
            return []
        }

        const { operator, fieldName, value } = filter as NotEmptyFilter

        switch (operator) {
            case and:
            case or:
                const res = value.reduce((o: {filter: SpannerParsedFilter[]}, f: Filter) => {
                    const res = this.parseFilter.bind(this)(f, inlineFields)
                    return {
                        filter: o.filter.concat( ...res ),
                    }
                }, { filter: [] })
                const op = operator === and ? ' AND ' : ' OR '
                return [{
                    filterExpr: res.filter.map((r: SpannerParsedFilter) => r.filterExpr).join( op ),
                    parameters: res.filter.reduce((o: any, s: SpannerParsedFilter) => ( { ...o, ...s.parameters } ), {} )
                }]
            case not:
                const res2: SpannerParsedFilter[] = this.parseFilter( value[0], inlineFields )
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
                filterExpr: `LOWER(${this.inlineVariableIfNeeded(fieldName, inlineFields)}) LIKE LOWER(${validateLiteral(fieldName)})`,
                parameters: { [fieldName]: this.valueForStringOperator(operator, value) }
            }]
        }

        if (operator === urlized) {
            return [{
                filterExpr: `LOWER(${escapeId(fieldName)}) RLIKE ${validateLiteral(fieldName)}`,
                parameters: { [fieldName]: value.map((s: string) => s.toLowerCase()).join('[- ]') }
            }]
        }
        
        if (operator === matches) {
            const ignoreCase = value.ignoreCase ? 'LOWER' : ''
            return [{
                filterExpr: `REGEXP_CONTAINS (${ignoreCase}(${escapeId(fieldName)}), ${ignoreCase}(${validateLiteral(fieldName)}))`,
                parameters: { [fieldName]: specArrayToRegex(value.spec) }
            }]
        }

        return []
    }

    parametersFor(name: string, value: any[]) {
        if (!isNull(value)) {
            if (!Array.isArray(value)) {
                return { [name]: this.patchTrueFalseValue(value) }
            } else {
                return value.reduce((o, v, i) => ( { ...o, [`${name}${i + 1}`]: v } ), {})
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

    prepareStatementVariables(n: any, fieldName: any) {

        return Array.from({ length: n }, (_, i) => validateLiteral(`${(fieldName)}${i + 1}`) )
                    .join(', ')
    }


    valueForOperator(fieldName: string, value: string | any[] | undefined, operator: string) {
        if (operator === include) {
            if (value === undefined || value.length === 0) {
                throw new InvalidQuery('include operator cannot have an empty list of arguments')
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
            default :
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
            expr: `${escapeFieldId(fieldName)} ${dir}`
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
                return inlineFields[patchFieldName(fieldName)]
            }
        }
        return escapeFieldId(fieldName)
    }

    selectFieldsFor(projection: any[]) {
        return projection.map(escapeFieldId).join(', ')
    }
}
