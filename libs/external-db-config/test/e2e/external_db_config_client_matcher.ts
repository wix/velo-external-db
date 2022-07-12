export const invalidConfigStatusResponse = () => expect.objectContaining({
    message: expect.stringContaining('Missing props'),
    validConfig: false,
    validAuthorization: false,
})
