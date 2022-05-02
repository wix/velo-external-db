const maskSensitiveData = (cfg) => {
    const config = { ...cfg }
    if (config.password) config.password = '*********'
    if (config.secretKey) config.secretKey = '*********'
    return config
}

const appInfoFor = async(operationService, configReaderClient) => {
    const connectionStatus = await operationService.connectionStatus()
    const { message: configReaderStatus, authorizationMessage: authorizationConfigStatus } = await configReaderClient.configStatus()
    
    return {
        configReaderStatus: configReaderStatus,
        authorizationConfigStatus, 
        config: maskSensitiveData(configReaderClient.readConfig()),
        dbConnectionStatus: connectionStatus.error || connectionStatus.status 
    }
}

module.exports = { appInfoFor, maskSensitiveData }