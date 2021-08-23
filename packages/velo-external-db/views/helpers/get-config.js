const getConfig = async (operationService, externalDbConfigClient) => {
    const configStatus = externalDbConfigClient.missingRequiredSecretsKeys.length ? `Missing props: ${externalDbConfigClient.missingRequiredSecretsKeys}` : 'External DB read successfully'
    const connectionStatus = await operationService.connectionStatus()
    return {
        CONFIG_STATUS: configStatus,
        CONFIG: externalDbConfigClient.getConfig(),
        CONNECTION_STATUS: connectionStatus.error || connectionStatus.STATUS 
    }
}

module.exports = { getConfig }