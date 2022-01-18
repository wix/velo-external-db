const { EMPTY_FILTER } = require('../../lib/converters/utils')
const { when } = require('jest-when')
const { AdapterFunctions } = require('velo-external-db-commons')

const filterTransformer = {
    transform: jest.fn(),
}

const stubEmptyFilterFor = (filter) => {
    when(filterTransformer.transform).calledWith(filter)
        .mockReturnValue(EMPTY_FILTER)
}

const givenFilterByIdWith = (id, filter) => {
    when(filterTransformer.transform).calledWith(filter)
                                .mockReturnValue({
                                    operator: AdapterFunctions.eq,
                                    fieldName: '_id',
                                    value: id
                                })
}

const givenTransformTo = (filter, transformedFilter) => {
    when(filterTransformer.transform).calledWith(filter)
                                .mockReturnValue(transformedFilter)
}

const reset = () => {
    filterTransformer.transform.mockClear()
}

module.exports = { filterTransformer, stubEmptyFilterFor, givenFilterByIdWith, givenTransformTo, reset, transform: filterTransformer.transform }