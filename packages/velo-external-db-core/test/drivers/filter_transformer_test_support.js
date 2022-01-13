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

const stubIgnoreTransform = (filter) => {
    when(filterTransformer.transform).calledWith(filter)
                                .mockReturnValue(filter)
}

const givenFilter = (filter) => {
    const fieldName = Object.keys(filter)[0]
    const operator = Object.keys(filter[fieldName])[0]
    const value = filter[fieldName][operator]
    when(filterTransformer.transform).calledWith(filter)
                                .mockReturnValue({
                                    fieldName,
                                    operator,
                                    value
                                })                         
}

const reset = () => {
    filterTransformer.transform.mockClear()
}

module.exports = { filterTransformer, stubEmptyFilterFor, givenFilterByIdWith, stubIgnoreTransform, reset, givenFilter }