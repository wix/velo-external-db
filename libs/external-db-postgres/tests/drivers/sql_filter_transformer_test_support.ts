import { EmptySort } from '@wix-velo/velo-external-db-commons'
import { when } from 'jest-when'
import { escapeIdentifier } from '../../src/postgres_utils'

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
                                .mockReturnValue({ filterExpr: '', parameters: [], offset: 1 })
}

export const stubEmptyOrderByFor = (sort: any) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EmptySort)
}

export const givenOrderByFor = (column: string, sort: any) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue({ sortExpr: `ORDER BY ${escapeIdentifier(column)} ASC`, sortColumns: [] })
}


export const givenFilterByIdWith = (id: any, filter: any) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier('_id')} = $1`, parameters: [id], offset: 2 })
}

export const givenAggregateQueryWith = (having: any, numericColumns: { name: string }[], columnAliases: string[], groupByColumns: string[], filter: any, offest: any) => {
    when(filterParser.parseAggregation).calledWith({ postFilteringStep: filter, processingStep: having }, offest)
                                       .mockReturnValue({
                                           fieldsStatement: `${groupByColumns.map( escapeIdentifier ).join(', ')}, MAX(${escapeIdentifier(numericColumns[0].name)}) AS ${escapeIdentifier(columnAliases[0])}, SUM(${escapeIdentifier(numericColumns[1].name)}) AS ${escapeIdentifier(columnAliases[1])}`,
                                           groupByColumns,
                                           offset: offest,
                                           havingFilter: '',
                                           parameters: [],
                                       })
}

export const givenAllFieldsProjectionFor = (projection: any) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                 .mockReturnValue('*')

export const givenProjectionExprFor = (projection: string[]) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                 .mockReturnValue(projection.map(escapeIdentifier).join(', '))

export const givenStartsWithFilterFor = (filter: any, column: string, value: any) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier(column)} ILIKE $1`, parameters: [`${value}%`], offset: 2 })

export const givenGreaterThenFilterFor = (filter: any, column: string, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier(column)} > $1`, parameters: [value], offset: 2 })

export const givenNotFilterQueryFor = (filter: any, column: string, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE NOT(${escapeIdentifier(column)} = $1)`, parameters: [value], offset: 2 })

export const givenMatchesFilterFor = (filter: any, column: string, value: string) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({
                                    filterExpr: `WHERE LOWER(${escapeIdentifier(column)}) ~ LOWER($1)`,
                                    parameters: [
                                        value.split('-').map((v: any, i: number, array: string | any[]) => 
                                        i === array.length-1 ? v: `${v}[ \t\n-]`)
                                        .join('')
                                    ],
                                    offset: 2
                                })

export const givenIncludeFilterForIdColumn = (filter: any, value: any) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier('_id')} IN ($1)`, parameters: [value], offset: 2 })


export const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
    filterParser.selectFieldsFor.mockClear()
}
