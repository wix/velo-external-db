const { when } = require('jest-when')

const configValidator = {
    readConfig: jest.fn(),
    validate: jest.fn(),
}

const commonConfigValidator = {
    readConfig: jest.fn(),
    validate: jest.fn(),
}

const authorizationConfigValidator = {
    readConfig: jest.fn(),
    validate: jest.fn(),
}

const givenConfig = (config) =>
    when(configValidator.readConfig).calledWith()
                                 .mockReturnValue(config)

const givenAuthorizationConfig = (config) => 
    when(authorizationConfigValidator.readConfig).calledWith()
                                              .mockReturnValue(config)

const givenValidConfig = () =>
    when(configValidator.validate).calledWith()
                               .mockReturnValue({ missingRequiredSecretsKeys: [] })

const givenCommonConfig = (secretKey) => 
    when(commonConfigValidator.readConfig).calledWith()
                                        .mockReturnValue({ secretKey })

const givenValidCommonConfig = () =>
    when(commonConfigValidator.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: [], validType: true, validVendor: true })


const givenInvalidConfigWith = (missing) =>
    when(configValidator.validate).calledWith()
                               .mockReturnValue({ missingRequiredSecretsKeys: missing })

const givenInvalidCommonConfigWith = (missing) =>
    when(commonConfigValidator.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: missing })

const givenInvalidCloudVendor = () =>
    when(commonConfigValidator.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: [], validType: true, validVendor: false })

const givenInvalidDBType = () =>
    when(commonConfigValidator.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: [], validType: false, validVendor: true })

const givenValidAuthorizationConfig = () => 
    when(authorizationConfigValidator.validate).calledWith()
                                            .mockReturnValue({ valid: true, message: 'Permissions config read successfully' })

const givenEmptyAuthorizationConfig = () =>
    when(authorizationConfigValidator.validate).calledWith()
                                            .mockReturnValue({ valid: false, message: 'Permissions config not defined, using default' })

const givenInvalidAuthorizationConfig = () => 
    when(authorizationConfigValidator.validate).calledWith()
                                            .mockReturnValue({ valid: false, message: 'Error in /collectionPermissions/0/read/0: must be equal to one of the allowed values' })
const reset = () => {
    configValidator.readConfig.mockClear()
    configValidator.validate.mockClear()

    commonConfigValidator.readConfig.mockClear()
    commonConfigValidator.validate.mockClear()

    authorizationConfigValidator.readConfig.mockClear(
    authorizationConfigValidator.validate.mockClear()
    )
}

module.exports = { configValidator, commonConfigValidator, authorizationConfigValidator, reset,
                   givenValidCommonConfig, 
                   givenConfig, givenValidConfig, givenInvalidConfigWith, givenInvalidCommonConfigWith,
                   givenInvalidCloudVendor, givenInvalidDBType, givenAuthorizationConfig, givenValidAuthorizationConfig,
                   givenEmptyAuthorizationConfig, givenInvalidAuthorizationConfig, givenCommonConfig
}