const maskSensitiveData = (cfg) => {
    const config = { ...cfg }
    if (config.password) config.password = '*********'
    if (config.secretKey) config.secretKey = '*********'
    return config
}

const appInfoFor = async (operationService, configReaderClient) => {
    const connectionStatus = await operationService.connectionStatus()
    const config = await configReaderClient.readConfig()
    const configReaderStatus = await configReaderClient.configStatus()
    return {
        configReaderStatus,
        config: maskSensitiveData(config),
        dbConnectionStatus: connectionStatus.error || connectionStatus.status 
    }
}

module.exports = { appInfoFor, maskSensitiveData }