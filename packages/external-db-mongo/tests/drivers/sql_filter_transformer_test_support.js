const { EMPTY_SORT } = require('velo-external-db-commons')
const { when } = require('jest-when')

const filterParser = {
    transform: jest.fn(),
    parseFilter: jest.fn(),
    orderBy: jest.fn(),
    parseAggregation: jest.fn(),
    selectFieldsFor: jest.fn()
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
                                 .mockReturnValue({ sortExpr: { sort: [[`${column}`, 'asc']] } })
}


const givenFilterByIdWith = (id, filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: {
                                    _id: id,
                                } })
}

const givenAggregateQueryWith = (having, numericColumns, columnAliases, groupByColumns, filter) => {
    const c = numericColumns.map(c => c.name)
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

const givenAllFieldsProjectionFor = (projection) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                 .mockReturnValue({})

const givenProjectionExprFor = (projection) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                 .mockReturnValue(projection.reduce((pV, cV) => (
                                    { ...pV, [cV]: 1 }
                                ), { _id: 0 }))


const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
    filterParser.selectFieldsFor.mockClear()
}

module.exports = { stubEmptyFilterAndSortFor, givenOrderByFor, stubEmptyOrderByFor,
                   stubEmptyFilterFor, givenFilterByIdWith, givenAggregateQueryWith,
                   givenAllFieldsProjectionFor, givenProjectionExprFor,
                   filterParser, reset
}