export default class DbConnector {
    initialized: boolean
    configValidatorProvider: any
    init: any
    dataProvider: any
    schemaProvider: any
    databaseOperations: any
    connection: any
    cleanup: any
    configValidator: any
    constructor(configValidator: any, init: any) {
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