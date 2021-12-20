const { EMPTY_FILTER } = require('../../utils')
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

const reset = () => {
    filterTransformer.transform.mockClear()
}

module.exports = { filterTransformer, stubEmptyFilterFor, givenFilterByIdWith, reset }