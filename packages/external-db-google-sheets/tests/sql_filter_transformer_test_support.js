const { EmptySort } = require('@wix-velo/velo-external-db-commons')
const { when } = require('jest-when')
// const { escapeId } = require('../../lib/mysql_utils');

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

const stubEmptyOrderByFor = (sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EmptySort)
}

const givenOrderByFor = (column, sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue({  sort: [ { field: column, direction: 'asc' } ] })

}


const givenFilterByIdWith = (id, filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `_id = "${id}"` })
}

const givenGreaterThenFilterFor = (filter, column, value) => 
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `${column} > ?`, parameters: [value] })

const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
}

module.exports = { stubEmptyOrderByFor, stubEmptyFilterFor, givenFilterByIdWith, givenOrderByFor, stubEmptyFilterAndSortFor, givenGreaterThenFilterFor,
    
     filterParser, reset }
