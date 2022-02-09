const configResponseFor = ( config ) => expect.objectContaining(config)

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

module.exports = { configResponseFor, validConfigStatusResponse, configResponseWithMissingProperties, 
    invalidVendorConfigStatusResponse, invalidDbTypeConfigStatusResponse }
