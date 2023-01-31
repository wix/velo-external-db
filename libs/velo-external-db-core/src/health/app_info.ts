import { AnyFixMe } from '@wix-velo/velo-external-db-types'

export const maskSensitiveData = (cfg: {[key: string]: any}) => {
    const config = { ...cfg }
    if (config['password']) config['password'] = '*********'
    if (config['secretKey']) config['secretKey'] = '*********'
    return config
}

// 1. fix config reader config client when moving configReader to ts
// 2. operation service - when declaring it as OperationService, there's a problem with mock and tests, create interface?
export const appInfoFor = async(operationService: AnyFixMe, configReaderClient: AnyFixMe) => {
    const connectionStatus = await operationService.connectionStatus()
    const { message: configReaderStatus, authorizationMessage: authorizationConfigStatus } = await configReaderClient.configStatus()
    const config = maskSensitiveData(await configReaderClient.readConfig())
    const debug = process.env['DEBUG'] === 'true'
    
    if (!debug) {
        if (config['authorization'] ) {
            config['authorization'] = Object.keys(config['authorization']).length
        }
        
        Object.keys(config).forEach(key => {
            if (key !== 'authorization') {
                delete config[key]
            }
        })
    }
    
    return {
        configReaderStatus: configReaderStatus,
        authorizationConfigStatus, 
        config,
        dbConnectionStatus: connectionStatus.error || connectionStatus.status,
        debug
    }
}
