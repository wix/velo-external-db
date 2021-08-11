const dataOperation = {
    checkIfConnectionSucceeded: jest.fn()
}

const givenValidPool = () =>
    dataOperation.checkIfConnectionSucceeded.mockResolvedValue({ '1': 1 })

const givenInvalidPool = (error) =>
    dataOperation.checkIfConnectionSucceeded.mockImplementation(() => { throw new error })

const reset = () => {
    dataOperation.checkIfConnectionSucceeded.mockClear()
}

module.exports = { dataOperation, reset, givenValidPool, givenInvalidPool }