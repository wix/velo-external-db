const configResponseFor = ( config, authorizationConfig ) => expect.objectContaining({
    ...config,
    authorization: authorizationConfig
})

const validConfigStatusResponse = () => expect.objectContaining({ 
    validConfig: true,
    message: expect.stringContaining('External DB Config read successfully'),  
})

const configResponseWithMissingProperties = ( missingProperties ) => expect.objectContaining({
    validConfig: false,
    message: expect.stringContaining([...missingProperties].join(', ')),  
})

const invalidVendorConfigStatusResponse = () => expect.objectContaining({
    validConfig: false,
    message: expect.stringContaining('Cloud type is not supported'),
})

const invalidDbTypeConfigStatusResponse = () => expect.objectContaining({
    validConfig: false,
    message: expect.stringContaining('DB type is not supported'),
})

const emptyAuthorizationConfigStatusResponse = () => expect.objectContaining({
    validAuthorization: false,
    authorizationMessage: expect.stringContaining('Permissions config not defined, using default') 
})

const invalidAuthorizationConfigStatusResponse = () => expect.objectContaining({
    validAuthorization: false,
    authorizationMessage: expect.stringContaining('Error in ')
})

module.exports = { configResponseFor, validConfigStatusResponse, configResponseWithMissingProperties, 
    invalidVendorConfigStatusResponse, invalidDbTypeConfigStatusResponse, emptyAuthorizationConfigStatusResponse,
    invalidAuthorizationConfigStatusResponse }
