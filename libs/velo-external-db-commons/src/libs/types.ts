import { ConnectionCleanUp, IDatabaseOperations, IDataProvider, ISchemaProvider } from '@wix-velo/velo-external-db-types'
import DbConnector from './db_connector'

export type Field = {
    field: string,
    type: string,
    subtype?: string,
    precision?: number,
    isPrimary?: boolean,
}

export type DatabaseFactoryResponse = {
    connector: DbConnector
    providers: {
        dataProvider: IDataProvider;
        schemaProvider: ISchemaProvider;
        databaseOperations: IDatabaseOperations;
    }
    cleanup: ConnectionCleanUp
    connection: any
}
