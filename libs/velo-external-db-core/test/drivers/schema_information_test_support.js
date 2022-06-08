const { SystemFields } = require('@wix-velo/velo-external-db-commons')
const { when } = require('jest-when')

const schemaInformation = {
    schemaFieldsFor: jest.fn(),
    refresh: jest.fn(),
}

const givenDefaultSchemaFor = collectionName => {
    when(schemaInformation.schemaFieldsFor).calledWith(collectionName)
                                           .mockResolvedValue( SystemFields.map(({ name, type, subtype }) => ({ field: name, type, subtype }) ) )
}

const expectSchemaRefresh = () =>
    when(schemaInformation.refresh).mockResolvedValue()

const givenSchemaFieldsResultFor = (dbs) =>
    dbs.forEach(db => when(schemaInformation.schemaFieldsFor).calledWith(db.id).mockResolvedValue(db.fields) )


const reset = () => {
    schemaInformation.schemaFieldsFor.mockClear()
    schemaInformation.refresh.mockClear()
}

module.exports = {
    givenDefaultSchemaFor, expectSchemaRefresh, givenSchemaFieldsResultFor,
    schemaInformation, reset
}