import{ EmptySort } from '@wix-velo/velo-external-db-commons'
import { when } from 'jest-when'

export const escapeIdentifier  = (i: any) => i

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

export const givenOrderByFor = (column: any, sort: any) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue({ sortExpr: `ORDER BY ${escapeIdentifier(column)} ASC`, sortColumns: [] })
}


export const givenFilterByIdWith = (id: any, filter: any) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier('_id')} = ?`, parameters: [id], offset: 2 })
}

export const givenAggregateQueryWith = (having: any, numericColumns: { name: any }[], columnAliases: any[], groupByColumns: any[], filter: any, offest: any) => {
    when(filterParser.parseAggregation).calledWith({ postFilteringStep: filter, processingStep: having })
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

export const givenProjectionExprFor = (projection: any[]) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue(projection.map(escapeIdentifier).join(', '))

export const givenStartsWithFilterFor = (filter: any, column: any, value: any) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier(column)} LIKE ?`, parameters: [`${value}%`] })

export const givenGreaterThenFilterFor =  (filter: any, column: any, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier(column)} > ?`, parameters: [value] })

export const givenNotFilterQueryFor = (filter: any, column: any, value: any) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE NOT (${escapeIdentifier(column)} = ?)`, parameters: [value] })

export const givenMatchesFilterFor = (filter: any, column: any, value: string) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({
                                    filterExpr: `WHERE REGEXP_CONTAINS (LOWER(${escapeIdentifier(column)}), LOWER(?))`,
                                    parameters: [value.split('-').map((v: any, i: number, array: string | any[]) =>
                                            i === array.length - 1 ? v : `${v}[ \t\n-]`)
                                            .join('')]
                                })

export const givenIncludeFilterForIdColumn = (filter: any, value: any) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier('_id')} IN (?)`, parameters: [value] })

export const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
    filterParser.selectFieldsFor.mockClear()
}
