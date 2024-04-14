import { ILogger } from '@wix-velo/external-db-logger'
import { ConnectionCleanUp, DbProviders, IConfigValidator, IDatabaseOperations, IDataProvider, ISchemaProvider, IIndexProvider } from '@wix-velo/velo-external-db-types'


export default class DbConnector {
    initialized: boolean
    configValidatorProvider: any
    init: (config: any, option: any, logger?: ILogger) => Promise<DbProviders<any>> | DbProviders<any>
    dataProvider!: IDataProvider
    schemaProvider!: ISchemaProvider
    indexProvider?: IIndexProvider
    databaseOperations!: IDatabaseOperations
    connection: any
    cleanup!: ConnectionCleanUp
    configValidator!: IConfigValidator
    type!: string
    logger?: ILogger
    constructor(
                configValidator: any, 
                init: (config: any, ...args: any) => Promise<DbProviders<any>> | DbProviders<any>,
                Logger?: ILogger
                ) {
        this.initialized = false
        this.configValidatorProvider = configValidator
        this.logger = Logger
        this.init = init
    }

    async initialize(config: any, options: any, logger?: ILogger) {
        const { dataProvider, schemaProvider, databaseOperations, indexProvider, connection, cleanup } = await this.init(config, options, logger)
        this.indexProvider = indexProvider
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
