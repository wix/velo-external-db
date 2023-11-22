import { when } from 'jest-when'

export const configValidator = {
    readConfig: jest.fn(),
    validate: jest.fn(),
}

export const commonConfigValidator = {
    readConfig: jest.fn(),
    validate: jest.fn(),
}

export const authorizationConfigValidator = {
    readConfig: jest.fn(),
    validate: jest.fn(),
}

export const givenConfig = (config: any) =>
    when(configValidator.readConfig).calledWith()
                                 .mockReturnValue(config)

export const givenAuthorizationConfig = (config: any) => 
    when(authorizationConfigValidator.readConfig).calledWith()
                                              .mockReturnValue(config)

export const givenValidConfig = () =>
    when(configValidator.validate).calledWith()
                               .mockReturnValue({ missingRequiredSecretsKeys: [] })

export const givenValidCommonConfig = () =>
    when(commonConfigValidator.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: [], validType: true, validVendor: true })


export const givenInvalidConfigWith = (missing: any) =>
    when(configValidator.validate).calledWith()
                               .mockReturnValue({ missingRequiredSecretsKeys: missing })

export const givenInvalidCommonConfigWith = (missing: any) =>
    when(commonConfigValidator.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: missing })

export const givenInvalidCloudVendor = () =>
    when(commonConfigValidator.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: [], validType: true, validVendor: false })

export const givenInvalidDBType = () =>
    when(commonConfigValidator.validate).calledWith()
                                     .mockReturnValueOnce({ missingRequiredSecretsKeys: [], validType: false, validVendor: true })

export const givenValidAuthorizationConfig = () => 
    when(authorizationConfigValidator.validate).calledWith()
                                            .mockReturnValue({ valid: true, message: 'Permissions config read successfully' })

export const givenEmptyAuthorizationConfig = () =>
    when(authorizationConfigValidator.validate).calledWith()
                                            .mockReturnValue({ valid: false, message: 'Permissions config not defined, using default' })

export const givenInvalidAuthorizationConfig = () => 
    when(authorizationConfigValidator.validate).calledWith()
                                            .mockReturnValue({ valid: false, message: 'Error in /collectionPermissions/0/read/0: must be equal to one of the allowed values' })
export const reset = () => {
    configValidator.readConfig.mockClear()
    configValidator.validate.mockClear()

    commonConfigValidator.readConfig.mockClear()
    commonConfigValidator.validate.mockClear()

    authorizationConfigValidator.readConfig.mockClear()
    authorizationConfigValidator.validate.mockClear()
}
