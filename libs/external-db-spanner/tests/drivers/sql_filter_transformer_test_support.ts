import { EmptySort } from '@wix-velo/velo-external-db-commons'
import { when } from 'jest-when'
import { escapeId, escapeFieldId, validateLiteral } from '../../src/spanner_utils'

export const filterParser = {
    transform: jest.fn(),
    parseFilter: jest.fn(),
    orderBy: jest.fn(),
    parseAggregation: jest.fn(),
    selectFieldsFor: jest.fn(),
}

export const stubEmptyFilterAndSortFor = (filter: any, sort: any) => {
    stubEmptyFilterFor(filter)
    stubEmptyOrderByFor(sort)
}

export const stubEmptyFilterFor = (filter: any) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: '', parameters: [] })
}

export const stubEmptyOrderByFor = (sort: any) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EmptySort)
}

const patchFieldName = (f: string) => {
    if (f.startsWith('_')) {
        return `x${f}`
    }
    return f
}


export const givenOrderByFor = (column: string, sort: any) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue({ sortExpr: `ORDER BY ${escapeFieldId(column)} ASC` })
}


export const givenFilterByIdWith = (id: any, filter: any) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeFieldId('_id')} = @_id`, parameters: { _id: id } })
}

export const givenAggregateQueryWith = (having: any, numericColumns: any[], columnAliases: any[], groupByColumns: { map: (arg0: { (f: any): any; (f: any): any }) => { (): any; new(): any; map: { (arg0: (value: any, forbidQualified?: boolean | undefined) => string): any; new(): any } } }, filter: any) => {
    const c = numericColumns.map((c: { name: any }) => c.name)
    when(filterParser.parseAggregation).calledWith({ postFilteringStep: filter, processingStep: having })
                                       .mockReturnValue({
                                           fieldsStatement: `${groupByColumns.map( patchFieldName ).map( escapeId )}, MAX(${escapeFieldId(c[0])}) AS ${escapeId(columnAliases[0])}, SUM(${escapeId(c[1])}) AS ${escapeId(columnAliases[1])}`,
                                           groupByColumns: groupByColumns.map( patchFieldName ),
                                           havingFilter: '',
                                           parameters: {},
                                       })
}

export const givenAllFieldsProjectionFor = (projection: any) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue('*')

export const givenProjectionExprFor = (projection: string[]) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue(projection.map(escapeFieldId).join(', '))

export const givenStartsWithFilterFor = (filter: any, column: string, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE LOWER(${escapeFieldId(column)}) LIKE LOWER(${validateLiteral(column)})`, parameters: { [column]: `${value}%` } })

export const givenGreaterThenFilterFor = (filter: any, column: string, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeFieldId(column)} > ${validateLiteral(column)}`, parameters: { [column]: value } })

export const givenNotFilterQueryFor = (filter: any, column: string, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE NOT ${escapeFieldId(column)} = ${validateLiteral(column)}`, parameters: { [column]: value } })

export const givenMatchesFilterFor = (filter: any, column: string, value: string) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({
                                    filterExpr: `WHERE REGEXP_CONTAINS (LOWER(${escapeFieldId(column)}), LOWER(${validateLiteral(column)}))`,
                                    parameters: {
                                        [column]: value.split('-').map((v: any, i: number, array: string | any[]) =>
                                            i === array.length - 1 ? v : `${v}[ \t\n-]`)
                                            .join('')
                                    }
                                })

export const givenIncludeFilterForIdColumn = (filter: any, id: any) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeFieldId('_id')} IN (${validateLiteral('_id')})`, parameters: {
                                    _id: id
                                } })

export const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
    filterParser.selectFieldsFor.mockClear()
}
