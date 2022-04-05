const { EmptySort } = require('velo-external-db-commons')
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
                              .mockReturnValue(EmptySort)
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

const givenStartsWithFilterFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: { [column]: { $regex: `^${value}`, $options: 'i' } } })


const givenGreaterThenFilterFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: { [column]: { $gt: value } } })

const givenNotFilterQueryFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: { $nor: [{ [column]: { $eq: value } }] } })

const givenMatchesFilterFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({
                                    filterExpr: {
                                        [column]: {
                                            $regex: 
                                                value.split('-').map((v, i, array) => 
                                                    i === array.length-1 ? `${v.toLowerCase()}`: `${v.toLowerCase()}[ \t\n-]`)
                                                    .join(''),
                                            $options: 'i'
                                        }
                                    }
                                })

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
                   givenGreaterThenFilterFor, givenNotFilterQueryFor, givenMatchesFilterFor
                   filterParser, reset
}