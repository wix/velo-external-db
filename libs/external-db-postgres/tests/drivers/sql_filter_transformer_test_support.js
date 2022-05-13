const { EmptySort } = require('velo-external-db-commons')
const { when } = require('jest-when')
const { escapeIdentifier } = require('../../lib/postgres_utils')

const filterParser = {
    transform: jest.fn(),
    parseFilter: jest.fn(),
    orderBy: jest.fn(),
    parseAggregation: jest.fn(),
    selectFieldsFor: jest.fn(),
}

const stubEmptyFilterAndSortFor = (filter, sort) => {
    stubEmptyFilterFor(filter)
    stubEmptyOrderByFor(sort)
}

const stubEmptyFilterFor = (filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: '', parameters: [], offset: 1 })
}

const stubEmptyOrderByFor = (sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EmptySort)
}

const givenOrderByFor = (column, sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue({ sortExpr: `ORDER BY ${escapeIdentifier(column)} ASC`, sortColumns: [] })
}


const givenFilterByIdWith = (id, filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier('_id')} = $1`, parameters: [id], offset: 2 })
}

const givenAggregateQueryWith = (having, numericColumns, columnAliases, groupByColumns, filter, offest) => {
    when(filterParser.parseAggregation).calledWith({ postFilteringStep: filter, processingStep: having }, offest)
                                       .mockReturnValue({
                                           fieldsStatement: `${groupByColumns.map( escapeIdentifier ).join(', ')}, MAX(${escapeIdentifier(numericColumns[0].name)}) AS ${escapeIdentifier(columnAliases[0])}, SUM(${escapeIdentifier(numericColumns[1].name)}) AS ${escapeIdentifier(columnAliases[1])}`,
                                           groupByColumns: groupByColumns,
                                           offset: offest,
                                           havingFilter: '',
                                           parameters: [],
                                       })
}

const givenAllFieldsProjectionFor = (projection) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                 .mockReturnValue('*')

const givenProjectionExprFor = (projection) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                 .mockReturnValue(projection.map(escapeIdentifier).join(', '))

const givenStartsWithFilterFor = (filter, column, value) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier(column)} ILIKE $1`, parameters: [`${value}%`], offset: 2 })

const givenGreaterThenFilterFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier(column)} > $1`, parameters: [value], offset: 2 })

const givenNotFilterQueryFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE NOT(${escapeIdentifier(column)} = $1)`, parameters: [value], offset: 2 })

const givenMatchesFilterFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({
                                    filterExpr: `WHERE LOWER(${escapeIdentifier(column)}) ~ LOWER($1)`,
                                    parameters: [
                                        value.split('-').map((v, i, array) => 
                                        i === array.length-1 ? v: `${v}[ \t\n-]`)
                                        .join('')
                                    ],
                                    offset: 2
                                })

const givenIncludeFilterForIdColumn = (filter, value) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier('_id')} IN ($1)`, parameters: [value], offset: 2 })


const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
    filterParser.selectFieldsFor.mockClear()
}

module.exports = { stubEmptyFilterAndSortFor, givenOrderByFor, stubEmptyOrderByFor, stubEmptyFilterFor, 
                   givenFilterByIdWith, givenAggregateQueryWith, givenAllFieldsProjectionFor,
                   givenProjectionExprFor, givenStartsWithFilterFor, givenGreaterThenFilterFor,
                   givenNotFilterQueryFor, givenMatchesFilterFor, givenIncludeFilterForIdColumn,
                   filterParser, reset
}