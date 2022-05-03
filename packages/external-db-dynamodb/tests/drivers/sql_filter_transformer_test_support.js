const { EmptySort } = require('velo-external-db-commons')
const { when } = require('jest-when')

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
                                .mockReturnValue({ filterExpr: '', queryable: false })
}

const stubEmptyOrderByFor = (sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EmptySort)
}

const givenFilterByIdWith = (id, filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: {
                                    KeyConditionExpression: '#_id = :_id',
                                    ExpressionAttributeNames: {
                                        '#_id': '_id'
                                    },
                                    ExpressionAttributeValues: {
                                        ':_id': id
                                    }
                                }, queryable: true
                            })
}

const givenAllFieldsProjectionFor = (projection) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue(
                                          {
                                              projectionExpr: '',
                                              projectionAttributeNames: {}
                                          }
                                      )

const givenProjectionExprFor = (projection) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue(
                                            {
                                                projectionExpr: projection.map(f => `#${f}`).join(', '),
                                                projectionAttributeNames: projection.reduce((pV, cV) => (
                                                    { ...pV, [`#${cV}`]: cV }
                                                ), {})
                                            }
                                        )

// eslint-disable-next-line no-unused-vars
const givenAggregateQueryWith = (having, numericColumns, columnAliases, groupByColumns, filter) => {}

const givenStartsWithFilterFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: {
                                    FilterExpression: `begins_with (#${column}, :${column})`,
                                    ExpressionAttributeNames: {
                                        [`#${column}`]: column
                                    },
                                    ExpressionAttributeValues: {
                                        [`:${column}`]: value
                                    }
                                }
                            })
                    
const givenGreaterThenFilterFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: {
                                    FilterExpression: `#${column} > :${column}`,
                                    ExpressionAttributeNames: {
                                        [`#${column}`]: column
                                    },
                                    ExpressionAttributeValues: {
                                        [`:${column}`]: value
                                    }
                                }
                            })


const givenNotFilterQueryFor = (filter, column, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: {
                                    FilterExpression: `NOT (#${column} = :${column})`,
                                    ExpressionAttributeNames: {
                                        [`#${column}`]: column
                                    },
                                    ExpressionAttributeValues: {
                                        [`:${column}`]: value
                                    }
                                }
                            })

const givenIncludeFilterFor_idColumn = (filter, value) =>
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: {
                                    FilterExpression: '#_id IN (:0)',
                                    ExpressionAttributeNames: {
                                        ['#_id']: '_id'
                                    },
                                    ExpressionAttributeValues: {
                                        [':0']: value
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

module.exports = { stubEmptyFilterAndSortFor, stubEmptyOrderByFor, stubEmptyFilterFor,
                   givenFilterByIdWith, filterParser, reset, givenAggregateQueryWith,
                   givenAllFieldsProjectionFor, givenProjectionExprFor, givenStartsWithFilterFor,
                   givenGreaterThenFilterFor, givenNotFilterQueryFor, givenIncludeFilterFor_idColumn
}