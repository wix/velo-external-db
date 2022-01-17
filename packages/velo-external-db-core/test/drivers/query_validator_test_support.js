const { when } = require('jest-when')

const queryValidator = {
    validateFilter: jest.fn(),
}

const expectValidFilter = (filter) => {
    when(queryValidator.validateFilter).calledWith(filter)
                                       .mockReturnValue()
}

const reset = () => {
    queryValidator.validateFilter.mockClear()
}

module.exports = {
    expectValidFilter, reset
}