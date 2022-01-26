const readConfigResponse = ( config, authConfig ) => expect.objectContaining({
    ...config,
    auth: authConfig
})

const configStatusResponse = () => expect.objectContaining({ 
    message: expect.stringContaining('External DB Config read successfully'), 
    valid: true 
})

const invalidConfigStatusResponse = ( missingProperties ) => expect.objectContaining({
    message: expect.stringContaining([...missingProperties].join(', ')),   
    valid: false
})

const invalidVendorConfigStatusResponse = () => expect.objectContaining({
    message: expect.stringContaining('Cloud type is not supported'),
    valid: false
})

const invalidDbTypeConfigStatusResponse = () => expect.objectContaining({
    message: expect.stringContaining('DB type is not supported'),
    valid: false
})

module.exports = { readConfigResponse, configStatusResponse, invalidConfigStatusResponse, 
    invalidVendorConfigStatusResponse, invalidDbTypeConfigStatusResponse }
