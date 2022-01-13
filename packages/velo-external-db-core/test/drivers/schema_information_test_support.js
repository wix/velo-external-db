const { SystemFields } = require('velo-external-db-commons')
const { when } = require('jest-when')

const schemaInformation = {
    schemaFieldsFor: jest.fn(),
    refresh: jest.fn(),
}

const givenDefaultSchemaFor = collectionName => {
    when(schemaInformation.schemaFieldsFor).calledWith(collectionName)
                                           .mockResolvedValue( SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) ) )
}

const giveSchemaWithFieldFor = (collectionName, field) => {
    when(schemaInformation.schemaFieldsFor).calledWith(collectionName)
                                           .mockResolvedValue([field])
}

const expectSchemaRefresh = () =>
    when(schemaInformation.refresh).mockResolvedValue()


const reset = () => {
    schemaInformation.schemaFieldsFor.mockClear()
    schemaInformation.refresh.mockClear()
}

module.exports = {
    givenDefaultSchemaFor, expectSchemaRefresh,
    schemaInformation, reset,
    giveSchemaWithFieldFor
}