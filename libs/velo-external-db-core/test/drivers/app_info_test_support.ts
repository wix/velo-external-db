import * as gen from '../gen'
import { when } from 'jest-when'

export const operationService = {
    validateConnection: jest.fn(),
    connectionStatus: jest.fn(),
}

export const configReaderClient = {
    readConfig: jest.fn(),
    configStatus: jest.fn(),
}

export const validConfigReaderStatus = 'External DB Config read successfully'
export const validDBConnectionStatus = 'Connected to database successfully'
export const missingRequiredConfigKeys = 'Missing props:'
export const wrongDBConnectionStatus = 'Failed to connect to database'

export const defineValidOperationService = () => {
    when(operationService.connectionStatus).calledWith()
                                           .mockReturnValue({ status: validDBConnectionStatus })
}

export const defineValidConfigReaderClient = (config: any) => {
    when(configReaderClient.readConfig).calledWith()
                                           .mockReturnValue(config)
    when(configReaderClient.configStatus).calledWith()
                                           .mockReturnValue({ message: validConfigReaderStatus })
}

export const defineBrokenConfigReaderClient = (config: any) => {
    const { deletedKey, newObject } = gen.deleteRandomKeyObject(config)
    when(configReaderClient.readConfig).calledWith()
                                           .mockReturnValue(newObject)
    when(configReaderClient.configStatus).calledWith()
                                           .mockReturnValue({ message: `${missingRequiredConfigKeys}: ${deletedKey}` })
}

export const defineBrokenOperationService = () => {
    when(operationService.connectionStatus).calledWith()
                                           .mockReturnValue({ error: wrongDBConnectionStatus })
}

export const reset = () => {
    operationService.validateConnection.mockClear() 
    operationService.connectionStatus.mockClear()
    configReaderClient.configStatus.mockClear()
    configReaderClient.readConfig.mockClear()
}
