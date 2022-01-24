const { when } = require('jest-when')

const configReader = {
    readConfig: jest.fn(),
    validate: jest.fn(),
}

const commonConfigReader = {
    validate: jest.fn(),
}

const givenConfig = (config) =>
    when(configReader.readConfig).calledWith()
                                 .mockResolvedValue(config)

const givenValidConfig = () =>
    when(configReader.validate).calledWith()
                               .mockResolvedValue({ missingRequiredSecretsKeys: [], validType: true, validVendor: true })

const givenValidCommonConfig = () =>
    when(commonConfigReader.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: [], validType: true, validVendor: true })


const givenInvalidConfigWith = (missing) =>
    when(configReader.validate).calledWith()
                               .mockResolvedValue({ missingRequiredSecretsKeys: missing })

const givenInvalidCommonConfigWith = (missing) =>
    when(commonConfigReader.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: missing })

const givenInvalidCloudVendor = () =>
    when(commonConfigReader.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: [], validType: true, validVendor: false })

const givenInvalidDBType = () =>
    when(commonConfigReader.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: [], validType: false, validVendor: true })

const reset = () => {
    configReader.readConfig.mockClear()
    configReader.validate.mockClear()

    commonConfigReader.validate.mockClear()
}

module.exports = { configReader, commonConfigReader, reset,
                   givenValidCommonConfig,
                   givenConfig, givenValidConfig, givenInvalidConfigWith, givenInvalidCommonConfigWith,
                   givenInvalidCloudVendor, givenInvalidDBType
}