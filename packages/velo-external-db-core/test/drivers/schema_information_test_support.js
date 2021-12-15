const { SystemFields } = require('velo-external-db-commons')
const { when } = require('jest-when')

const schemaInformation = {
    schemaFor: jest.fn(),
    refresh: jest.fn(),
}

const givenDefaultSchemaFor = collectionName => {
    when(schemaInformation.schemaFor).calledWith(collectionName)
                                     .mockResolvedValue( { id: collectionName, fields: SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }), {}) })
}

const expectSchemaRefresh = () =>
    when(schemaInformation.refresh).mockResolvedValue()


const reset = () => {
    schemaInformation.schemaFor.mockClear()
    schemaInformation.refresh.mockClear()
}

module.exports = {
    givenDefaultSchemaFor, expectSchemaRefresh,
    schemaInformation, reset
}