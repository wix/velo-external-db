const { EMPTY_SORT } = require('./sql_filter_transformer')
const { when } = require('jest-when')
const {escapeId} = require("mysql");

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
                                .mockReturnValue({ filterExpr: '', parameters: [] })
}

const stubEmptyHavingFilterFor = (filter) => {
    when(filterParser.parseFilter).calledWith(filter)
                                  .mockReturnValue([ { filterExpr: '', parameters: [] } ])
}

const givenHavingFilterWith = (columns, filter) => {
    when(filterParser.parseFilter).calledWith(filter)
                                  .mockReturnValue([ { filterExpr: columns.map(c => `${escapeId(c)} > ?`).join(' AND '), parameters: [0, 0] } ])
}

const stubEmptyOrderByFor = (sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EMPTY_SORT)
}

const givenOrderByFor = (column, sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue({ sortExpr: `ORDER BY ${escapeId(column)} ASC` })
}


const givenFilterByIdWith = (id, filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeId('_id')} = ?`, parameters: [id] })
}

const givenAggregateQueryWith = (having, numericColumns, columnAliases, groupByColumns) => {
    const c = numericColumns.map(c => c.name)
    when(filterParser.parseAggregation).calledWith(having)
                                       .mockReturnValue({
                                           fieldsStatement: `${groupByColumns.map( escapeId )}, MAX(${escapeId(c[0])}) AS ${escapeId(columnAliases[0])}, SUM(${escapeId(c[1])}) AS ${escapeId(columnAliases[1])}`,
                                           groupByColumns: groupByColumns,
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