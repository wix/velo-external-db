'use strict'

import DataService from './service/data'
import CacheableSchemaInformation from './service/schema_information'
import SchemaService from './service/schema'
import OperationService from './service/operation'
import FilterTransformer from './converters/filter_transformer'
import AggregationTransformer from './converters/aggregation_transformer'
import QueryValidator from './converters/query_validator'
import SchemaAwareDataService from './service/schema_aware_data'
import { initServices, createRouter } from './router'
import { DbConnector } from '@wix-velo/velo-external-db-commons'
import { DataHooks, ExternalDbRouterConfig, Hooks, SchemaHooks, ServiceContext } from './types'
import ItemTransformer = require('./converters/item_transformer')
import { RoleAuthorizationService } from '@wix-velo/external-db-security'
import { ConfigValidator, AuthorizationConfigValidator, CommonConfigValidator } from '@wix-velo/external-db-config'
import { Logger } from '@wix-velo/external-db-logger'
import { ConnectionCleanUp } from '@wix-velo/velo-external-db-types'
import { Router } from 'express'
import { CollectionCapability } from './spi-model/capabilities'
import { decodeBase64 } from './utils/base64_utils'

export class ExternalDbRouter {
    connector: DbConnector
    configValidator: ConfigValidator
    operationService: OperationService
    schemaInformation: CacheableSchemaInformation
    filterTransformer: FilterTransformer
    aggregationTransformer: AggregationTransformer
    queryValidator: QueryValidator
    dataService: DataService
    itemTransformer: ItemTransformer
    schemaAwareDataService: SchemaAwareDataService
    schemaService: SchemaService
    roleAuthorizationService: RoleAuthorizationService
    cleanup: ConnectionCleanUp
    router: Router
    config: ExternalDbRouterConfig
    logger: Logger
    constructor({ connector, config, hooks }: { connector: DbConnector, config: ExternalDbRouterConfig, hooks: {schemaHooks?: SchemaHooks, dataHooks?: DataHooks}}) {
        this.isInitialized(connector)
        this.logger = new Logger()
        this.connector = connector
        this.configValidator = new ConfigValidator(connector.configValidator, new AuthorizationConfigValidator(config.authorization), 
                                                   new CommonConfigValidator({ vendor: config.vendor, type: config.adapterType, jwtPublicKey: config.jwtPublicKey, appDefId: config.appDefId }, 
                                                   config.commonExtended))
        this.config = config
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

    reloadHooks(hooks?: Hooks) {
        initServices(this.schemaAwareDataService, this.schemaService, this.operationService, this.configValidator, { ...this.config, type: this.connector.type }, this.filterTransformer, this.aggregationTransformer, this.roleAuthorizationService, hooks || {})
    }

    isInitialized(connector: DbConnector) {
        if (!connector.initialized) {
            throw new Error('Connector must be initialized before being used')
        }
    }
}

export * as types from './types'
export * as dataSpi from './spi-model/data_source'
export * as collectionSpi from './spi-model/collection'
export * as schemaUtils from '../src/utils/schema_utils'
export * as dataConvertUtils from './converters/data_utils'
export * as convertersUtils from './converters/utils'
export { config } from './roles-config.json'
export { DataService, SchemaService, OperationService, CacheableSchemaInformation, FilterTransformer, AggregationTransformer, QueryValidator, SchemaAwareDataService, ItemTransformer, Hooks, ServiceContext, CollectionCapability, decodeBase64 }
