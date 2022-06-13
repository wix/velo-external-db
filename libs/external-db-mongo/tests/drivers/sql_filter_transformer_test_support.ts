import { EmptySort } from '@wix-velo/velo-external-db-commons'
import { when } from 'jest-when'
import { jest } from '@jest/globals'

const filterParser = {
    transform: jest.fn(),
    parseFilter: jest.fn(),
    orderBy: jest.fn(),
    parseAggregation: jest.fn(),
    selectFieldsFor: jest.fn()
}

const stubEmptyFilterAndSortFor = (filter: any, sort: any) => {
    stubEmptyFilterFor(filter)
    stubEmptyOrderByFor(sort)
}

const stubEmptyFilterFor = (filter: any) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: {} })
}

const stubEmptyOrderByFor = (sort: any) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EmptySort)
}

const givenOrderByFor = (column: any, sort: any) => {
    when(filterParser.orderBy).calledWith(sort)
                                 .mockReturnValue({ sortExpr: { sort: [[`${column}`, 'asc']] } })
}


const givenFilterByIdWith = (id: any, filter: any) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: {
                                    _id: id,
                                } })
}

const givenAggregateQueryWith = (having: any, numericColumns: any[], columnAliases: any[], groupByColumns: any, filter: any) => {
    const c = numericColumns.map((c: { name: any }) => c.name)
    when(filterParser.parseAggregation).calledWith({ postFilteringStep: filter, processingStep: having })
                                       .mockReturnValue({
                                        fieldsStatement: {
                                            $group: {
                                            _id: '$_id',
                                            [columnAliases[0]]: { $max: `$${c[0]}` },
                                            [columnAliases[1]]: { $sum: `$${c[1]}` }
                                        } }, 
                                        groupByColumns: groupByColumns,
                                        havingFilter: { $match: {} },
                                       })
}

const givenAllFieldsProjectionFor = (projection: any) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                 .mockReturnValue({})

const givenProjectionExprFor = (projection: any[]) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                 .mockReturnValue(projection.reduce((pV: any, cV: any) => (
                                    { ...pV, [cV]: 1 }
                                ), { _id: 0 }))

const givenStartsWithFilterFor = (filter: any, column: any, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: { [column]: { $regex: `^${value}`, $options: 'i' } } })


const givenGreaterThenFilterFor = (filter: any, column: any, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: { [column]: { $gt: value } } })

const givenNotFilterQueryFor = (filter: any, column: any, value: any) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: { $nor: [{ [column]: { $eq: value } }] } })

const givenMatchesFilterFor = (filter: any, column: any, value: string) =>
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

const givenIncludeFilterForIdColumn = (filter: any, value: any) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: { _id: { $in: [value] } } })

const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
    filterParser.selectFieldsFor.mockClear()
}

module.exports = { stubEmptyFilterAndSortFor, givenOrderByFor, stubEmptyOrderByFor,
                   stubEmptyFilterFor, givenFilterByIdWith, givenAggregateQueryWith,
                   givenAllFieldsProjectionFor, givenProjectionExprFor, givenStartsWithFilterFor,
                   givenGreaterThenFilterFor, givenNotFilterQueryFor, givenMatchesFilterFor, givenIncludeFilterForIdColumn,
                   filterParser, reset
}