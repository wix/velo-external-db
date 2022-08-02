import { jest } from '@jest/globals'
const { when } = require('jest-when')
import { LastLetterCoder } from '../../src/firestore_utils'
const escapeId = (x: string) => x


const EmptySort: any = []

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
                                .mockReturnValue(EmptySort)
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
                              .mockReturnValue([{ fieldName: column, direction: 'asc' }])
}

export const givenFilterByIdWith = (id: any, filter: any) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue([{ fieldName: '_id', opStr: '==', value: id }])
}

export const givenAggregateQueryWith = (having: any, numericColumns: any[], columnAliases: string[], groupByColumns: any[], filter: any) => {
    const c = numericColumns.map((c: { name: any }) => c.name)
    when(filterParser.parseAggregation).calledWith(having, filter)
                                       .mockReturnValue({
                                           fieldsStatement: `${groupByColumns.map( patchFieldName ).map( escapeId )}, MAX(${escapeId(patchFieldName(c[0]))}) AS ${escapeId(columnAliases[0])}, SUM(${escapeId(c[1])}) AS ${escapeId(columnAliases[1])}`,
                                           groupByColumns: groupByColumns.map( patchFieldName ),
                                           havingFilter: '',
                                           parameters: {},
                                       })
}

export const givenAllFieldsProjectionFor = (projection: any) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue()

export const givenProjectionExprFor = (projection: any) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue(projection)


export const givenStartsWithFilterFor = (filter: any, column: any, value: any) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue([{
                                    fieldName: column,
                                    opStr: '>=',
                                    value,
                                },
                                {
                                    fieldName: column,
                                    opStr: '<',
                                    value: value + LastLetterCoder
                                }])

export const givenGreaterThenFilterFor = (filter: any, column: any, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue([{
                                    fieldName: column,
                                    opStr: '>',
                                    value,
                                }])

export const givenIncludeFilterForIdColumn = (filter: any, value: any) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue([{
                                    fieldName: '_id',
                                    opStr: 'in',
                                    value: [value],
                                }])

export const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
    filterParser.selectFieldsFor.mockClear()
}
