/* eslint-disable no-undef */
const { when } = require('jest-when')
const escapeId = x => x

const EMPTY_SORT = []

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
                                .mockReturnValue(EMPTY_SORT)
}

const stubEmptyOrderByFor = (sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EMPTY_SORT)
}

const patchFieldName = (f) => {
    if (f.startsWith('_')) {
        return `x${f}`
    }
    return f
}

const givenOrderByFor = (column, sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue([{ fieldName: column, direction: 'asc' }])
}

const givenFilterByIdWith = (id, filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue([{ fieldName: '_id', opStr: '==', value: id }])
}

const givenAggregateQueryWith = (having, numericColumns, columnAliases, groupByColumns, filter) => {
    const c = numericColumns.map(c => c.name)
    when(filterParser.parseAggregation).calledWith(having, filter)
                                       .mockReturnValue({
                                           fieldsStatement: `${groupByColumns.map( patchFieldName ).map( escapeId )}, MAX(${escapeId(patchFieldName(c[0]))}) AS ${escapeId(columnAliases[0])}, SUM(${escapeId(c[1])}) AS ${escapeId(columnAliases[1])}`,
                                           groupByColumns: groupByColumns.map( patchFieldName ),
                                           havingFilter: '',
                                           parameters: {},
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
                   filterParser, reset
}