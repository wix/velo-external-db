const dataOperation = {
    validateConnection: jest.fn()
}

const givenValidPool = () =>
    dataOperation.validateConnection.mockResolvedValue({ valid: true })

const givenInvalidPool = (error) =>
    dataOperation.validateConnection.mockImplementation(() => { return { valid: false, error } })

const reset = () => {
    dataOperation.validateConnection.mockClear()
}

module.exports = { dataOperation, reset, givenValidPool, givenInvalidPool }