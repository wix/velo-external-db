const configResponseFor = ( config, authConfig ) => expect.objectContaining({
    ...config,
    auth: authConfig
})

const validConfigStatusResponse = () => expect.objectContaining({ 
    validAuthConfig: true,
    validConfig: true,
    message: expect.stringContaining('External DB Config read successfully'),  
})

const configResponseWithMissingProperties = ( missingProperties ) => expect.objectContaining({
    validAuthConfig: true,
    validConfig: false,
    message: expect.stringContaining([...missingProperties].join(', ')),  
})

const invalidVendorConfigStatusResponse = () => expect.objectContaining({
    validAuthConfig: true,
    validConfig: false,
    message: expect.stringContaining('Cloud type is not supported'),
})

const invalidDbTypeConfigStatusResponse = () => expect.objectContaining({
    validAuthConfig: true,
    validConfig: false,
    message: expect.stringContaining('DB type is not supported'),
})

module.exports = { configResponseFor, validConfigStatusResponse, configResponseWithMissingProperties, 
    invalidVendorConfigStatusResponse, invalidDbTypeConfigStatusResponse }
