const { when } = require('jest-when')

const aggregationTransformer = {
    transform: jest.fn(),
}

const givenAggregateTransformResult = (aggregation) => {
    when(aggregationTransformer.transform).calledWith(aggregation)
                                          .mockReturnValue(aggregation)
}

const reset = () => {
    aggregationTransformer.transform.mockClear()
}


module.exports = { aggregationTransformer, givenAggregateTransformResult, reset, transform: aggregationTransformer.transform }