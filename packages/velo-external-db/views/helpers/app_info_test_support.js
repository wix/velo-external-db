const { when } = require('jest-when')

const operationService = {
    validateConnection: jest.fn(),
    connectionStatus: jest.fn(),
}



const reset = () => {
    operationService.validateConnection.mockClear()
    operationService.connectionStatus.mockClear()
}

module.exports = { operationService, reset, }