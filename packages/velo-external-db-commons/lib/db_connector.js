class DbConnector {
    constructor(configValidator, init) {
        this.initialized = false
        this.configValidatorProvider = configValidator
        this.init = init
    }

    async initialize(config, options) {
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

module.exports = DbConnector