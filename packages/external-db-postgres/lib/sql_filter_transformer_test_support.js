const { EMPTY_SORT } = require('./sql_filter_transformer')
const { when } = require('jest-when')
const { escapeIdentifier } = require('./postgres_utils')

const filterParser = {
    transform: jest.fn(),
    parseFilter: jest.fn(),
    orderBy: jest.fn(),
    parseAggregation: jest.fn(),
}

const stubEmptyFilterAndSortFor = (filter, sort) => {
    stubEmptyFilterFor(filter)
    stubEmptyOrderByFor(sort)
}

const stubEmptyFilterFor = (filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: '', filterColumns: [], parameters: [], offset: 1 })
}

const stubEmptyHavingFilterFor = (filter) => {
    when(filterParser.parseFilter).calledWith(filter)
                                  .mockReturnValue([ { filterExpr: '', filterColumns: [], parameters: [], offset: 1 } ])
}

const givenHavingFilterWith = (columnAlias, filter, columns, _offset) => {
    const offset = _offset || 0
    when(filterParser.parseFilter).calledWith(filter)
                                  .mockReturnValue([ { filterExpr: `MAX(${escapeIdentifier(columns[0].name)}) > $${1 + offset} AND SUM(${escapeIdentifier(columns[1].name)}) > $${2 + offset}`, filterColumns: [], parameters: [0, 0] } ])
}

const stubEmptyOrderByFor = (sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EMPTY_SORT)
}

const givenOrderByFor = (column, sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue({ sortExpr: `ORDER BY ${escapeIdentifier(column)} ASC`, sortColumns: [] })
}


const givenFilterByIdWith = (id, filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier('_id')} = $1`, filterColumns: [], parameters: [id], offset: 2 })
}

const givenAggregateQueryWith = (having, numericColumns, columnAliases, groupByColumns, filter, offest) => {
    when(filterParser.parseAggregation).calledWith(having, filter, offest)
                                       .mockReturnValue({
                                           fieldsStatement: `${groupByColumns.map( escapeIdentifier ).join(', ')}, MAX(${escapeIdentifier(numericColumns[0].name)}) AS ${escapeIdentifier(columnAliases[0])}, SUM(${escapeIdentifier(numericColumns[1].name)}) AS ${escapeIdentifier(columnAliases[1])}`,
                                           fieldsStatementColumns: [],
                                           groupByColumns: groupByColumns,
                                           offset: offest,
                                           havingFilter: '',
                                           parameters: [],
                                       })
}



const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
}

module.exports = { stubEmptyFilterAndSortFor, givenOrderByFor, stubEmptyOrderByFor,
                   stubEmptyFilterFor, givenFilterByIdWith, givenAggregateQueryWith,
                   givenHavingFilterWith, stubEmptyHavingFilterFor,
                   filterParser, reset
}