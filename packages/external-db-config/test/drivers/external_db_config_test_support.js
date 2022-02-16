const { when } = require('jest-when')

const configReader = {
    readConfig: jest.fn(),
    validate: jest.fn(),
}

const commonConfigReader = {
    validate: jest.fn(),
}

const authConfigReader = {
    readConfig: jest.fn(),
    validate: jest.fn(),
}

const authorizationConfigReader = {
    readConfig: jest.fn(),
    validate: jest.fn(),
}

const givenConfig = (config) =>
    when(configReader.readConfig).calledWith()
                                 .mockResolvedValue(config)

const givenAuthConfig = (config) =>
    when(authConfigReader.readConfig).calledWith()
                                     .mockResolvedValue(config)

const givenAuthorizationConfig = (config) => 
    when(authorizationConfigReader.readConfig).calledWith()
                                              .mockResolvedValue(config)

const givenValidConfig = () =>
    when(configReader.validate).calledWith()
                               .mockResolvedValue({ missingRequiredSecretsKeys: [] })

const givenValidAuthConfig = () =>
    when(authConfigReader.validate).calledWith()
                               .mockResolvedValue({ missingRequiredSecretsKeys: [] })

const givenValidCommonConfig = () =>
    when(commonConfigReader.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: [], validType: true, validVendor: true })


const givenInvalidConfigWith = (missing) =>
    when(configReader.validate).calledWith()
                               .mockResolvedValue({ missingRequiredSecretsKeys: missing })

const givenInvalidAuthConfigWith = (missing) =>
    when(authConfigReader.validate).calledWith()
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
    
    authConfigReader.readConfig.mockClear()
    authConfigReader.validate.mockClear()

    commonConfigReader.validate.mockClear()

    authorizationConfigReader.readConfig.mockClear()
}

module.exports = { configReader, commonConfigReader, authConfigReader, authorizationConfigReader, reset,
                   givenValidCommonConfig, 
                   givenValidAuthConfig, givenAuthConfig, givenInvalidAuthConfigWith,
                   givenConfig, givenValidConfig, givenInvalidConfigWith, givenInvalidCommonConfigWith,
                   givenInvalidCloudVendor, givenInvalidDBType, givenAuthorizationConfig
}