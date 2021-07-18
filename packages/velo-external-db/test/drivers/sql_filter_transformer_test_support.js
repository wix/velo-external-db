const { EMPTY_SORT } = require('external-db-mysql')
const { when } = require('jest-when')

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
                                .mockReturnValue({ filterExpr: '', filterColumns: [], parameters: [] })
}

const stubEmptyHavingFilterFor = (filter) => {
    when(filterParser.parseFilter).calledWith(filter)
                                  .mockReturnValue([ { filterExpr: '', filterColumns: [], parameters: [] } ])
}

const givenHavingFilterWith = (columns, filter) => {
    when(filterParser.parseFilter).calledWith(filter)
                                  .mockReturnValue([ { filterExpr: columns.map(() => '?? > ?').join(' AND '), filterColumns: columns, parameters: [0, 0] } ])
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

const givenAggregateQueryWith = (having, numericColumns, columnAliases, groupByColumns) => {
    const c = numericColumns.map(c => c.name)
    const columns = []
    for (let i = 0; i < columnAliases.length; i++) {
        columns.push(c[i])
        columns.push(columnAliases[i])
    }

    when(filterParser.parseAggregation).calledWith(having)
                                       .mockReturnValue({
                                           fieldsStatement: `??, MAX(??) AS ??, SUM(??) AS ??`,
                                           fieldsStatementColumns: [...groupByColumns, ...columns],
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