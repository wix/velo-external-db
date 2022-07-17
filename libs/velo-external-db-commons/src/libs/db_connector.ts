import { ConnectionCleanUp, DbProviders, IConfigValidator, IDatabaseOperations, IDataProvider, ISchemaProvider } from "@wix-velo/velo-external-db-types"

type DbFactoryResponse = {
    connector: DbConnector
    providers: {
        dataProvider: IDataProvider;
        schemaProvider: ISchemaProvider;
        databaseOperations: IDatabaseOperations;    
    }
    cleanup: ConnectionCleanUp
}

export default class DbConnector {
    initialized: boolean
    configValidatorProvider: any
    init: (config: any, ...args: any) => Promise<DbProviders<any>> | DbProviders<any>
    dataProvider!: IDataProvider
    schemaProvider!: ISchemaProvider
    databaseOperations!: IDatabaseOperations
    connection: any
    cleanup!: ConnectionCleanUp
    configValidator!: IConfigValidator
    type!: string
    constructor(configValidator: any, init: (config: any, ...args: any) => Promise<DbProviders<any>> | DbProviders<any>) {
        this.initialized = false
        this.configValidatorProvider = configValidator
        this.init = init
    }

    async initialize(config: any, options: any) {
        const { dataProvider, schemaProvider, databaseOperations, connection, cleanup } = await this.init(config, options)
        this.dataProvider = dataProvider
        this.schemaProvider = schemaProvider
        this.databaseOperations = databaseOperations
        this.connection = connection
        this.cleanup = cleanup
        this.configValidator = new this.configValidatorProvider(config)
        this.initialized = true
        return { dataProvider, schemaProvider, databaseOperations, connection, cleanup }
    }
}