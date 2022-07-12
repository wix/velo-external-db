import { when } from 'jest-when'

export const aggregationTransformer = {
    transform: jest.fn(),
}

export const givenTransformTo = (aggregation: any, transformedAggregation: any) => {
    when(aggregationTransformer.transform).calledWith(aggregation)
                                          .mockReturnValue(transformedAggregation)
}

export const reset = () => {
    aggregationTransformer.transform.mockClear()
}

const transform = aggregationTransformer.transform
export { transform }

