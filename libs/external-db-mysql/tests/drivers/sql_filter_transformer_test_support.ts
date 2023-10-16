import { EmptySort } from '@wix-velo/velo-external-db-commons'
import { when } from 'jest-when'
import { escapeId } from '../../src/mysql_utils'

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

export const givenOrderByFor = (column: string, sort: any) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue({ sortExpr: `ORDER BY ${escapeId(column)} ASC` })
}


export const givenFilterByIdWith = (id: any, filter: any) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeId('_id')} = ?`, parameters: [id] })
}

export const givenAggregateQueryWith = (having: any, numericColumns: any[], columnAliases: string[], groupByColumns: string[], filter: any) => {
    const c = numericColumns.map((c: { name: any }) => c.name)
    when(filterParser.parseAggregation).calledWith({ postFilteringStep: filter, processingStep: having })
                                       .mockReturnValue({
                                           fieldsStatement: `${groupByColumns.map( escapeId )}, MAX(${escapeId(c[0])}) AS ${escapeId(columnAliases[0])}, SUM(${escapeId(c[1])}) AS ${escapeId(columnAliases[1])}`,
                                           groupByColumns,
                                           havingFilter: '',
                                           parameters: [],
                                       })
}

export const givenAllFieldsProjectionFor = (projection: any) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue('*')

export const givenProjectionExprFor = (projection: string[]) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue(projection.map(escapeId).join(', '))

export const givenStartsWithFilterFor = (filter: any, column: string, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                  .mockReturnValue({ filterExpr: `WHERE ${escapeId(column)} LIKE ?`, parameters: [`${value}%`] })

export const givenGreaterThenFilterFor = (filter: any, column: string, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                    .mockReturnValue({ filterExpr: `WHERE ${escapeId(column)} > ?`, parameters: [value] })


export const givenNotFilterQueryFor = (filter: any, column: string, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE NOT (${escapeId(column)} = ?)`, parameters: [value] })



export const givenMatchesFilterFor = (filter: any, column: string, value: string) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE LOWER(${escapeId(column)}) RLIKE LOWER(?)`, parameters: [
                                    value.split('-').map((v: any, i: number, array: string | any[]) => 
                                        i === array.length-1 ? v: `${v}[ \t\n-]`)
                                        .join('')
                                ] })

export const givenIncludeFilterForIdColumn = (filter: any, value: any) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeId('_id')} IN (?)`, parameters: [value] })

export const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
}
