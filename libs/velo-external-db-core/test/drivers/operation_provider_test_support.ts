export const dataOperation = {
    validateConnection: jest.fn()
}

export const givenValidPool = () =>
    dataOperation.validateConnection.mockResolvedValue({ valid: true })

export const givenInvalidPool = (error: any) =>
    dataOperation.validateConnection.mockImplementation(() => { return { valid: false, error } })

export const reset = () => {
    dataOperation.validateConnection.mockClear()
}
