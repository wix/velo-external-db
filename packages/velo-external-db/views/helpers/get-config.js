const maskSensitiveData = (cfg) => {
    const config = Object.assign({}, cfg)
    if (config.password) config.password = '*********'
    if (config.secretKey) config.secretKey = '*********'
    return config
}

const getConfig = async (operationService, externalDbConfigClient) => {
    const connectionStatus = await operationService.connectionStatus()
    const config = await externalDbConfigClient.readConfig()
    return {
        CONFIG_STATUS: externalDbConfigClient.configStatus(),
        CONFIG: maskSensitiveData(config),
        CONNECTION_STATUS: connectionStatus.error || connectionStatus.STATUS 
    }
}

module.exports = { getConfig }