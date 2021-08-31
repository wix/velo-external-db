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

const givenDBConnectionStatus = (connectionStatus) => {
    when(operationService.connectionStatus).calledWith()
                                           .mockReturnValue({ STATUS: connectionStatus })
}

const givenConfig = (config) => {
    when(configReaderClient.readConfig).calledWith()
                                           .mockReturnValue(config);
    when(configReaderClient.configStatus).calledWith()
                                           .mockReturnValue(validConfigReaderStatus)
}

const reset = () => {
    operationService.validateConnection.mockClear()
    operationService.connectionStatus.mockClear()
    configReaderClient.configStatus.mockClear()
    configReaderClient.readConfig.mockClear()
}

module.exports = { operationService, configReaderClient, validConfigStatus, validDBConnectionStatus,
    givenConfig, givenDBConnectionStatus, reset}