const maskSensitiveData = (cfg) => {
    const config = { ...cfg }
    if (config.password) config.password = '*********'
    if (config.secretKey) config.secretKey = '*********'
    return config
}

const configReaderStatusFor = async(configReaderClient) => {
    const { missingRequiredSecretsKeys, missingRequiredEnvs, validType, validVendor } = await configReaderClient.configStatus()

    if (missingRequiredSecretsKeys.length > 0 || (missingRequiredEnvs && missingRequiredEnvs.length > 0)) {
        return `Missing props: ${[...missingRequiredSecretsKeys, missingRequiredEnvs].join(', ')}`
    }

    else if (!validVendor) {
        return 'Cloud type is not supported'
    }

    else if (!validType) {
        return 'DB type is not supported'
    }

    return 'External DB Config read successfully'
}

const appInfoFor = async(operationService, configReaderClient) => {
    const connectionStatus = await operationService.connectionStatus()
    const config = await configReaderClient.readConfig()
    const configReaderStatus = await configReaderStatusFor(configReaderClient)

    return {
        configReaderStatus,
        config: maskSensitiveData(config),
        dbConnectionStatus: connectionStatus.error || connectionStatus.status 
    }
}

module.exports = { appInfoFor, maskSensitiveData }