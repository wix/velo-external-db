const invalidConfigStatusResponse = () => expect.objectContaining({
    message: expect.stringContaining('Missing props'),
    validConfig: false,
})

module.exports = { invalidConfigStatusResponse }
