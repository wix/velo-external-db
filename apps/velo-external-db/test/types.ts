
import { Server } from 'http'
import { ExternalDbRouter } from '@wix-velo/velo-external-db-core'
import { 
    ConnectionCleanUp, 
    ISchemaProvider,
    IDataProvider, 
    DataOperation, 
    FieldType, 
    CollectionOperation,
    AnyFixMe 
} from '@wix-velo/velo-external-db-types'


export interface ColumnsCapabilities {
    [columnTypeName: string]: { sortable: boolean, columnQueryOperators: string[]}
}

export interface Capabilities {
    ReadWriteOperations: DataOperation[]
    ReadOnlyOperations: DataOperation[]
    FieldTypes: FieldType[]
    CollectionOperations: CollectionOperation[]
    ColumnsCapabilities: ColumnsCapabilities
}

export interface App {
    server: Server
    schemaProvider: ISchemaProvider
    cleanup: ConnectionCleanUp
    started: boolean
    reload: (hooks?: any) => Promise<{ externalDbRouter: ExternalDbRouter }>
    externalDbRouter: ExternalDbRouter
}

type Internals = () => App

export interface E2E_ENV {
    app: App
    externalDbRouter: ExternalDbRouter
    internals: Internals
    capabilities: Capabilities,
    enviormentVariables: { [key: string]: string }
}

export interface ProviderResourcesEnv {
    dataProvider: IDataProvider
    schemaProvider: ISchemaProvider
    cleanup: ConnectionCleanUp
    driver: AnyFixMe
    capabilities: Capabilities
}


