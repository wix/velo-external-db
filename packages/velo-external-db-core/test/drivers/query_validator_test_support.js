const { when } = require('jest-when')

const queryValidator = {
    validateFilter: jest.fn(),
}

const expectValidFilter = (fields, filter) => {
    when(queryValidator.validateFilter).calledWith(fields, filter)
                                       .mockReturnValue()
}

const reset = () => {
    queryValidator.validateFilter.mockClear()
}

module.exports = {
    queryValidator, expectValidFilter, reset
}