const { EMPTY_SORT } = require('velo-external-db-commons')
const { when } = require('jest-when')
const { escapeId, validateLiteral, patchFieldName } = require('../../lib/mongo_utils');

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
                                .mockReturnValue({ filterExpr: {} })
}

const stubEmptyOrderByFor = (sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EMPTY_SORT)
}

const givenOrderByFor = (column, sort) => {
    when(filterParser.orderBy).calledWith(sort)
                                 .mockReturnValue({ sortExpr: { sort: column } })
}


const givenFilterByIdWith = (id, filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: {
                                    '_id' : id,
                                }})
}

const givenAggregateQueryWith = (having, numericColumns, columnAliases, groupByColumns, filter) => {
    const c = numericColumns.map(c => c.name)
    when(filterParser.parseAggregation).calledWith(having, filter)
                                       .mockReturnValue({
                                        fieldsStatement: {
                                            $group: {
                                            _id: '$_id',
                                            [columnAliases[0]]: { $max: `$${c[0]}`},
                                            [columnAliases[1]]: { $sum: `$${c[1]}`}
                                        }}, 
                                        groupByColumns: groupByColumns,
                                        havingFilter: { $match: {}},
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