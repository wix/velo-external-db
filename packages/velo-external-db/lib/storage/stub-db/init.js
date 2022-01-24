const { StubDataProvider, StubDatabaseOperations, StubSchemaProvider } = require ('./providers')

const init = (type) => (
    { dataProvider: new StubDataProvider(), schemaProvider: new StubSchemaProvider(), databaseOperations: new StubDatabaseOperations(type), connection: {}, cleanup: {} }
)

module.exports = init