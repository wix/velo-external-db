const { when } = require('jest-when')

const aggregationTransformer = {
    transform: jest.fn(),
}

const givenTransformTo = (aggregation, transformedAggregation) => {
    when(aggregationTransformer.transform).calledWith(aggregation)
                                          .mockReturnValue(transformedAggregation)
}

const reset = () => {
    aggregationTransformer.transform.mockClear()
}

module.exports = { aggregationTransformer, givenTransformTo, reset, transform: aggregationTransformer.transform }
