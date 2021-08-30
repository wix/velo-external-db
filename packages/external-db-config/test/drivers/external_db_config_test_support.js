const { when } = require('jest-when')

const configReader = {
    getSecrets: jest.fn(),
    validate: jest.fn(),
}

const commonConfigReader = {
    validate: jest.fn(),
}

const givenConfig = (config) =>
    when(configReader.getSecrets).calledWith()
                                 .mockResolvedValue(config)

const givenValidConfig = () =>
    when(configReader.validate).calledWith()
                               .mockResolvedValue({ missingRequiredSecretsKeys: [] })

const givenValidCommonConfig = () =>
    when(commonConfigReader.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: [] })

const givenInvalidConfigWith = (missing) =>
    when(configReader.validate).calledWith()
                               .mockResolvedValue({ missingRequiredSecretsKeys: missing })

const givenInvalidCommonConfigWith = (missing) =>
    when(commonConfigReader.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: missing })


const reset = () => {
    configReader.getSecrets.mockClear()
    configReader.validate.mockClear()

    commonConfigReader.validate.mockClear()
}

module.exports = { configReader, commonConfigReader, reset,
                   givenValidCommonConfig,
                   givenConfig, givenValidConfig, givenInvalidConfigWith, givenInvalidCommonConfigWith
}