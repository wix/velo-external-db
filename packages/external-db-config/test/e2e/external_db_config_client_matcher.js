const invalidConfigStatusResponse = () => expect.objectContaining({
    message: expect.stringContaining('Missing props'),
    validAuthConfig: false,
    validConfig: false,
})

module.exports = { invalidConfigStatusResponse }
