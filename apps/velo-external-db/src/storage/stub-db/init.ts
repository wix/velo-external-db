import { StubDataProvider, StubDatabaseOperations, StubSchemaProvider } from './providers'

export default (type: string) => (
    { dataProvider: new StubDataProvider(), schemaProvider: new StubSchemaProvider(), databaseOperations: new StubDatabaseOperations(type), connection: {}, cleanup: {} }
)
