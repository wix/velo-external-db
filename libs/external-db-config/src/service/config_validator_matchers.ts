export const configResponseFor = ( config: any, authorizationConfig: any ) => expect.objectContaining({
    ...config,
    authorization: authorizationConfig
})

export const validConfigStatusResponse = () => expect.objectContaining({ 
    validConfig: true,
    message: expect.stringContaining('External DB Config read successfully'),  
})

export const configResponseWithMissingProperties = ( missingProperties: any ) => expect.objectContaining({
    validConfig: false,
    message: expect.stringContaining([...missingProperties].join(', ')),  
})

export const invalidVendorConfigStatusResponse = () => expect.objectContaining({
    validConfig: false,
    message: expect.stringContaining('Cloud type is not supported'),
})

export const invalidDbTypeConfigStatusResponse = () => expect.objectContaining({
    validConfig: false,
    message: expect.stringContaining('DB type is not supported'),
})

export const emptyAuthorizationConfigStatusResponse = () => expect.objectContaining({
    validAuthorization: false,
    authorizationMessage: expect.stringContaining('Permissions config not defined, using default') 
})

export const invalidAuthorizationConfigStatusResponse = () => expect.objectContaining({
    validAuthorization: false,
    authorizationMessage: expect.stringContaining('Error in ')
})
