'use strict'

const DataService = require('./service/data')
const CacheableSchemaInformation = require('./service/schema_information')
const SchemaService = require('./service/schema')
const OperationService = require('./service/operation')
const FilterTransformer = require ('./converters/filter_transformer')
const AggregationTransformer = require ('./converters/aggregation_transformer')
const QueryValidator = require ('./converters/query_validator')
const SchemaAwareDataService = require ('./service/schema_aware_data')
const ItemTransformer = require('./converters/item_transformer')
const { initServices, createRouter } = require('./router')
const { RoleAuthorizationService } = require ('@wix-velo/external-db-security')
const { ConfigValidator, AuthorizationConfigValidator, CommonConfigValidator } = require ('@wix-velo/external-db-config')


class ExternalDbRouter {
    constructor({ connector, config, hooks }) {
        this.isInitialized(connector)
        this.connector = connector
        this.configValidator = new ConfigValidator(connector.configValidator, new AuthorizationConfigValidator(config.authorization), new CommonConfigValidator({ secretKey: config.secretKey, vendor: config.vendor }))
        
        this.operationService = new OperationService(connector.databaseOperations)
        this.schemaInformation = new CacheableSchemaInformation(connector.schemaProvider)
        this.filterTransformer = new FilterTransformer()
        this.aggregationTransformer = new AggregationTransformer(this.filterTransformer)
        this.queryValidator = new QueryValidator()
        this.dataService = new DataService(connector.dataProvider)
        this.itemTransformer = new ItemTransformer()
        this.schemaAwareDataService = new SchemaAwareDataService(this.dataService, this.queryValidator, this.schemaInformation, this.itemTransformer)
        this.schemaService = new SchemaService(connector.schemaProvider, this.schemaInformation)

        this.roleAuthorizationService = new RoleAuthorizationService(config.authorization?.roleConfig?.collectionPermissions) 
        this.cleanup = connector.cleanup
        
        initServices(this.schemaAwareDataService, this.schemaService, this.operationService, this.configValidator, { ...config, type: connector.type }, this.filterTransformer, this.aggregationTransformer, this.roleAuthorizationService, hooks)
        this.router = createRouter()
    }

    reloadHooks(hooks) {
        initServices(this.schemaAwareDataService, this.schemaService, this.operationService, this.configValidator, { ...this.config, type: this.connector.type }, this.filterTransformer, this.aggregationTransformer, this.roleAuthorizationService, hooks)
    }

    isInitialized(connector) {
        if (!connector.initialized) {
            throw new Error('Connector must be initialized before being used')
        }
    }
}

module.exports = { DataService, SchemaService, OperationService, CacheableSchemaInformation, FilterTransformer, AggregationTransformer, QueryValidator, SchemaAwareDataService, ItemTransformer, ExternalDbRouter }