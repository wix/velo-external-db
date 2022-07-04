import { EmptySort } from '@wix-velo/velo-external-db-commons'
import { when } from 'jest-when'

export const filterParser = {
    transform: jest.fn(),
    parseFilter: jest.fn(),
    orderBy: jest.fn(),
    parseAggregation: jest.fn(),
    selectFieldsFor: jest.fn(),
}

export const stubEmptyFilterAndSortFor = (filter: any, sort: any) => {
    stubEmptyFilterFor(filter)
    stubEmptyOrderByFor(sort)
}

export const stubEmptyFilterFor = (filter: any) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: '', queryable: false })
}

export const stubEmptyOrderByFor = (sort: any) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EmptySort)
}

export const givenFilterByIdWith = (id: any, filter: any) => {
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

export const givenAllFieldsProjectionFor = (projection: any) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue(
                                          {
                                              projectionExpr: '',
                                              projectionAttributeNames: {}
                                          }
                                      )

export const givenProjectionExprFor = (projection: any[]) => 
    when(filterParser.selectFieldsFor).calledWith(projection)
                                      .mockReturnValue(
                                            {
                                                projectionExpr: projection.map((f: any) => `#${f}`).join(', '),
                                                projectionAttributeNames: projection.reduce((pV: any, cV: any) => (
                                                    { ...pV, [`#${cV}`]: cV }
                                                ), {})
                                            }
                                        )

export const givenAggregateQueryWith = (_having: any, _numericColumns: any, _columnAliases: any, _groupByColumns: any, _filter: any) => {}

export const givenStartsWithFilterFor = (filter: any, column: any, value: any) =>
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
                    
export const givenGreaterThenFilterFor = (filter: any, column: any, value: any) =>
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


export const givenNotFilterQueryFor = (filter: any, column: any, value: any) =>
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

export const givenIncludeFilterForIdColumn = (filter: any, value: any) =>
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

export const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
    filterParser.selectFieldsFor.mockClear()
}
