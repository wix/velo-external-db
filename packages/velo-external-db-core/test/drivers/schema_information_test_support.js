const { SystemFields } = require('velo-external-db-commons')
const { when } = require('jest-when')

const schemaInformation = {
    schemaFor: jest.fn(),
    refresh: jest.fn(),
}

const givenDefaultSchemaFor = collectionName => {
    when(schemaInformation.schemaFor).calledWith(collectionName)
                                     .mockResolvedValue( { id: collectionName, fields: SystemFields.reduce((s, f) => ({ ...s, [f.name]: { type: f.type, subtype: f.subtype }}), {}) })
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