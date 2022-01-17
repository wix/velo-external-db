const { when } = require('jest-when')

const aggregationTransformer = {
    transform: jest.fn(),
}

const stubIgnoreTransform = (aggregation) => {
    when(aggregationTransformer.transform).calledWith(aggregation)
                                          .mockReturnValue(aggregation)
}

const reset = () => {
    aggregationTransformer.transform.mockClear()
}


module.exports = { aggregationTransformer, stubIgnoreTransform, reset }