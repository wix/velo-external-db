const { SystemFields } = require('velo-external-db-commons')
const { when } = require('jest-when')

const queryValidator = {
    validateFilter: jest.fn(),
}

const givenValidFilterForDefaultFieldsOf = (filter) => {
    when(queryValidator.validateFilter).calledWith(SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) ), filter)
                                       .mockReturnValue()
}

const reset = () => {
    queryValidator.validateFilter.mockClear()
}

module.exports = {
    queryValidator, givenValidFilterForDefaultFieldsOf, reset, validateFilter: queryValidator.validateFilter
}