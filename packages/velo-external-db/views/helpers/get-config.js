const getConfig = async (operationService, externalDbConfigClient) => {
    const connectionStatus = await operationService.connectionStatus()
    return {
        CONFIG_STATUS: externalDbConfigClient.configStatus(),
        CONFIG: externalDbConfigClient.getConfig(),
        CONNECTION_STATUS: connectionStatus.error || connectionStatus.STATUS 
    }
}

module.exports = { getConfig }