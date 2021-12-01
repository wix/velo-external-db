const { gen } = require('test-commons')
const { when } = require('jest-when')

const operationService = {
    validateConnection: jest.fn(),
    connectionStatus: jest.fn(),
}

const configReaderClient = {
    readConfig: jest.fn(),
    configStatus: jest.fn(),
}

const validConfigReaderStatus = 'External DB Config read successfully'
const validDBConnectionStatus = 'Connected to database successfully'
const missingRequiredConfigKeys = 'Missing props:'
const wrongDBConnectionStatus = 'Failed to connect to database'

const defineValidOperationService = () => {
    when(operationService.connectionStatus).calledWith()
                                           .mockReturnValue({ status: validDBConnectionStatus })
}

const defineValidConfigReaderClient = (config) => {
    when(configReaderClient.readConfig).calledWith()
                                           .mockReturnValue(config)
    when(configReaderClient.configStatus).calledWith()
                                           .mockReturnValue(validConfigReaderStatus)
}

const defineBrokenConfigReaderClient = (config) => {
    const { deletedKey, newObject } = gen.deleteRandomKeyObject(config)
    when(configReaderClient.readConfig).calledWith()
                                           .mockReturnValue(newObject)
    when(configReaderClient.configStatus).calledWith()
                                           .mockReturnValue(`${missingRequiredConfigKeys}: ${deletedKey}`)
}

const defineBrokenOperationService = () => {
    when(operationService.connectionStatus).calledWith()
                                           .mockReturnValue({ error: wrongDBConnectionStatus })
}

const reset = () => {
    operationService.validateConnection.mockClear() 
    operationService.connectionStatus.mockClear()
    configReaderClient.configStatus.mockClear()
    configReaderClient.readConfig.mockClear()
}

module.exports = { operationService, configReaderClient, validDBConnectionStatus, validConfigReaderStatus, wrongDBConnectionStatus,
    defineValidConfigReaderClient, defineValidOperationService, defineBrokenConfigReaderClient, defineBrokenOperationService,
     missingRequiredConfigKeys, reset }