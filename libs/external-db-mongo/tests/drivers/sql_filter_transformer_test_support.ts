import { EmptySort } from '../../src/mongo_utils'
import { when } from 'jest-when'
import { jest } from '@jest/globals'

export const filterParser = {
    transform: jest.fn(),
    parseFilter: jest.fn(),
    orderBy: jest.fn(),
    parseAggregation: jest.fn(),
    orderAggregationBy: jest.fn(),
    selectFieldsFor: jest.fn()
}

export const stubEmptyFilterAndSortFor = (filter: any, sort: any) => {
    stubEmptyFilterFor(filter)
    stubEmptyOrderByFor(sort)
}

export const stubEmptyFilterFor = (filter: any) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: {} })
}

export const stubEmptyOrderByFor = (sort: any) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EmptySort)
    when(filterParser.orderAggregationBy).calledWith(sort)
                              .mockReturnValue({ $sort: {} })
}

export const givenOrderByFor = (column: any, sort: any) => {
    when(filterParser.orderBy).calledWith(sort)
                                 .mockReturnValue({ sortExpr: { sort: [[`${column}`, 'asc']] } })
}


export const givenFilterByIdWith = (id: any, filter: any) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: {
                                    _id: id,
                                } })
}

export const givenAggregateQueryWith = (having: any, numericColumns: any[], columnAliases: any[], groupByColumns: any, filter: any) => {
    const c = numericColumns.map((c: { name: any }) => c.name)
    when(filterParser.parseAggregation).calledWith({ postFilteringStep: filter, processingStep: having })
                                       .mockReturnValue({
                                        fieldsStatement: {
                                            $group: {
                                            _id: '$_id',
                                            [columnAliases[0]]: { $max: `$${c[0]}` },
                                            [columnAliases[1]]: { $sum: `$${c[1]}` }
                                        } }, 
                                        groupByColumns,
                                        havingFilter: { $match: {} },
                                       })
}

export const givenAllFieldsProjectionFor = (projection: any) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                 .mockReturnValue({})

export const givenProjectionExprFor = (projection: any[]) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                 .mockReturnValue(projection.reduce((pV: any, cV: any) => (
                                    { ...pV, [cV]: 1 }
                                ), { _id: 0 }))

export const givenStartsWithFilterFor = (filter: any, column: any, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: { [column]: { $regex: `^${value}`, $options: 'i' } } })


export const givenGreaterThenFilterFor = (filter: any, column: any, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: { [column]: { $gt: value } } })

export const givenNotFilterQueryFor = (filter: any, column: any, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: { $nor: [{ [column]: { $eq: value } }] } })

export const givenMatchesFilterFor = (filter: any, column: any, value: string) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({
                                    filterExpr: {
                                        [column]: {
                                            $regex: 
                                                value.split('-').map((v: string, i: number, array: string | any[]) => 
                                                    i === array.length-1 ? `${v.toLowerCase()}`: `${v.toLowerCase()}[ \t\n-]`)
                                                    .join(''),
                                            $options: 'i'
                                        }
                                    }
                                })

export const givenIncludeFilterForIdColumn = (filter: any, value: any) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: { _id: { $in: [value] } } })

export const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.orderAggregationBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
    filterParser.selectFieldsFor.mockClear()
}
