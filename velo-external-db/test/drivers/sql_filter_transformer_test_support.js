const { EMPTY_SORT } = require('../../src/storage/gcp/sql/sql_filter_transformer')
const { when } = require('jest-when')

const filterParser = {
    transform: jest.fn(),
    orderBy: jest.fn(),
}

const stubEmptyFilterAndSortFor = (filter, sort) => {
    stubEmptyFilterFor(filter)
    stubEmptyOrderByFor(sort)
}

const stubEmptyFilterFor = (filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: '', filterColumns: [], parameters: [] })
}

const stubEmptyOrderByFor = (sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EMPTY_SORT)
}

const givenOrderByFor = (column, sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue({ sortExpr: 'ORDER BY ?? ASC', sortColumns: [column] })
}


const givenFilterByIdWith = (id, filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: 'WHERE ?? = ?', filterColumns: ['_id'], parameters: [id] })
}

const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
}

module.exports = { stubEmptyFilterAndSortFor, givenOrderByFor, stubEmptyOrderByFor, stubEmptyFilterFor, givenFilterByIdWith, filterParser, reset }