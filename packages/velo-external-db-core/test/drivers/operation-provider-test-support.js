const dataOperation = {
    validateConnection: jest.fn()
}

const givenValidPool = () =>
    dataOperation.validateConnection.mockResolvedValue({ '1': 1 })

const givenInvalidPool = (error) =>
    dataOperation.validateConnection.mockImplementation(() => { throw new error })

const reset = () => {
    dataOperation.validateConnection.mockClear()
}

module.exports = { dataOperation, reset, givenValidPool, givenInvalidPool }