const maskSensitiveData = (cfg) => {
    const config = Object.assign({}, cfg)
    if (config.password) config.password = '*********'
    if (config.secretKey) config.secretKey = '*********'
    return config
}

const getConfig = async (operationService, ConfigReaderClient) => {
    const connectionStatus = await operationService.connectionStatus()
    const config = await ConfigReaderClient.readConfig()
    const CONFIG_STATUS = await ConfigReaderClient.configStatus()
    return {
        CONFIG_STATUS,
        CONFIG: maskSensitiveData(config),
        CONNECTION_STATUS: connectionStatus.error || connectionStatus.STATUS 
    }
}

module.exports = { getConfig, maskSensitiveData }