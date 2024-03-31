import * as path from 'path'
import * as BPromise from 'bluebird'
import * as express from 'express'
import * as compression from 'compression'
import { errorMiddleware } from './web/error-middleware'
import { appInfoFor } from './health/app_info'
import { errors } from '@wix-velo/velo-external-db-commons'

import { config } from './roles-config.json'
import { authRoleMiddleware } from './web/auth-role-middleware'
import { unless, includes } from './web/middleware-support'
import { getAppInfoPage } from './utils/router_utils'
import { requestContextFor, DataActions, dataPayloadFor, DataHooksForAction } from './data_hooks_utils'
import { SchemaActions, SchemaHooksForAction, schemaPayloadFor } from './schema_hooks_utils'
import SchemaService from './service/schema'
import IndexService from './service/indexing'
import OperationService from './service/operation'
import { AnyFixMe, CollectionOperationSPI, DataOperation } from '@wix-velo/velo-external-db-types'
import SchemaAwareDataService from './service/schema_aware_data'
import FilterTransformer from './converters/filter_transformer'
import AggregationTransformer from './converters/aggregation_transformer'
import { RoleAuthorizationService } from '@wix-velo/external-db-security'
import { DataHooks, Hooks, RequestContext, SchemaHooks, ServiceContext } from './types'
import { ConfigValidator } from '@wix-velo/external-db-config'
import * as dataSource from './spi-model/data_source'
import * as schemaSource from './spi-model/collection'
import { JWTVerifier } from './web/jwt-verifier'
import { JWTVerifierDecoderMiddleware } from './web/jwt-verifier-decoder-middleware'
import { ILogger } from '@wix-velo/external-db-logger'
import { CreateIndexRequest, ListIndexesRequest, RemoveIndexRequest } from './spi-model/indexing'

const { query: Query, count: Count, aggregate: Aggregate, insert: Insert, update: Update, remove: Remove, truncate: Truncate } = DataOperation
const { Get, Create, Update: UpdateSchema, Delete } = CollectionOperationSPI
type RouterConfig = { type?: string, vendor?: string, hideAppInfo?: boolean, jwtPublicKey: string, appDefId: string, readOnlySchema?: boolean }

let schemaService: SchemaService, indexService: IndexService, operationService: OperationService, externalDbConfigClient: ConfigValidator, schemaAwareDataService: SchemaAwareDataService, cfg: RouterConfig, filterTransformer: FilterTransformer, aggregationTransformer: AggregationTransformer,  dataHooks: DataHooks, schemaHooks: SchemaHooks //roleAuthorizationService: RoleAuthorizationService,
let logger: ILogger | undefined


export const initServices = (_schemaAwareDataService: SchemaAwareDataService, _schemaService: SchemaService, _operationService: OperationService,
                             _indexService: IndexService, _externalDbConfigClient: ConfigValidator, _cfg: RouterConfig,
                             _filterTransformer: FilterTransformer, _aggregationTransformer: AggregationTransformer,
                             _roleAuthorizationService: RoleAuthorizationService, _hooks: Hooks, _logger: ILogger | undefined) => {
    schemaService = _schemaService
    operationService = _operationService
    indexService = _indexService
    externalDbConfigClient = _externalDbConfigClient
    cfg = _cfg
    schemaAwareDataService = _schemaAwareDataService
    filterTransformer = _filterTransformer
    aggregationTransformer = _aggregationTransformer
    // roleAuthorizationService = _roleAuthorizationService
    dataHooks = _hooks?.dataHooks || {}
    schemaHooks = _hooks?.schemaHooks || {}
    logger = _logger
}

const serviceContext = (): ServiceContext => ({
    dataService: schemaAwareDataService,
    schemaService
})


const executeDataHooksFor = async<T>(action: string, payload: T, requestContext: RequestContext, customContext: any): Promise<T> => {
    logger?.debug(`Data params before ${action} hook`, payload as any)
    return BPromise.reduce(DataHooksForAction[action], async(lastHookResult: AnyFixMe, hookName: string) => {
        return await executeHook(dataHooks, hookName, lastHookResult, requestContext, customContext)
    }, payload).then( res => {
        logger?.debug(`data params after ${action} hook`, res as any)
        return res
    })
}

const executeSchemaHooksFor = async<T>(action: string, payload: T, requestContext: RequestContext, customContext: any): Promise<T> => {
    logger?.debug(`Schema params before ${action} hook`, payload as any)
    return BPromise.reduce(SchemaHooksForAction[action], async(lastHookResult: any, hookName: string) => {
        return await executeHook(schemaHooks, hookName, lastHookResult, requestContext, customContext)
    }, payload).then( res => {
        logger?.debug(`Schema params after ${action} hook`, res as any)
        return res
    })
}

const executeHook = async(hooks: DataHooks | SchemaHooks, _actionName: string, payload: AnyFixMe, requestContext: RequestContext, customContext: any) => {
    const actionName = _actionName as keyof typeof hooks
    if (hooks[actionName]) {
        try {
            // @ts-ignore
            const payloadAfterHook = await hooks[actionName](payload, requestContext, serviceContext(), customContext)
            return payloadAfterHook || payload
        } catch (e: any) {
            if (e.status) throw e
            throw new errors.UnrecognizedError(e.message || e)
        }
    }
    return payload
}

export const createRouter = () => {
    const router = express.Router()
    router.use(express.text({ limit: '6mb' }))
    router.use(compression())
    router.use('/assets', express.static(path.join(__dirname, 'assets')))
    const jwtVerifier = new JWTVerifier(cfg.jwtPublicKey, cfg.appDefId)
    const jwtVerifierDecoderMiddleware = new JWTVerifierDecoderMiddleware(jwtVerifier)
    router.use(unless(['/', '/info', '/capabilities', '/favicon.ico', '/provision', '/connectionStatus'], jwtVerifierDecoderMiddleware.verifyAndDecodeMiddleware()))

    config.forEach(({ pathPrefix, roles }) => router.use(includes([pathPrefix], authRoleMiddleware({ roles }))))

    //set timeout of 2 minutes per request
    router.use((req, res, next) => {
        const twoMintuesInMs = 120000
        res.setTimeout(twoMintuesInMs, () => {
            logger?.warn('Request Timeout', { url: req.url, method: req.method })
            res.status(408).send('Request Timeout')
        })
        next()
    })

    // *************** INFO **********************
    router.get('/', async(req, res) => {
        const { hideAppInfo } = cfg
        const appInfo = await appInfoFor(operationService, externalDbConfigClient, cfg.hideAppInfo)
        const appInfoPage = await getAppInfoPage(appInfo, hideAppInfo) 

        res.send(appInfoPage)
    })

    router.post('/v3/capabilities/get', async(req, res) => {
        const unsupportedFieldTypes = [ schemaSource.FieldType.arrayString, schemaSource.FieldType.reference, schemaSource.FieldType.multiReference, 
                                        schemaSource.FieldType.arrayDocument, schemaSource.FieldType.array ]
        const capabilitiesResponse = {
            supportsCollectionModifications: cfg.readOnlySchema ? false : true,
            supportedFieldTypes: Object.values(schemaSource.FieldType).filter(t => !unsupportedFieldTypes.includes(t)),
            indexptions: {
                supportsIndexes: indexService.storage ? true : false,
                maxNumberOfRegularIndexesPerCollection: 10,
                maxNumberOfUniqueIndexesPerCollection: 10,
                maxNumberOfIndexesPerCollection: 20,
            } 
        }

        res.json(capabilitiesResponse)
    })

    router.post('/v3/provision', async(req, res) => {
        const { type, vendor } = cfg
        res.json({ type, vendor, protocolVersion: 3, adapterVersion: 'v3' })
    })

    router.get('/connectionStatus', async(req, res) => {
        const appInfo = await appInfoFor(operationService, externalDbConfigClient, cfg.hideAppInfo)
        res.json({ ...appInfo })
    })

    // *************** Data API **********************
    router.post('/v3/items/query', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionId, query, returnTotalCount } = await executeDataHooksFor(DataActions.BeforeQuery, dataPayloadFor(Query, req.body), requestContextFor(Query, req.body), customContext) as dataSource.QueryRequest

            const offset = query.paging ? query.paging.offset : 0
            const limit = query.paging ? query.paging.limit : 50
            const sort: dataSource.Sorting[] = query.sort ? query.sort : [{ fieldName: '_id', order: dataSource.SortOrder.ASC }]

            const data = await schemaAwareDataService.find(
                collectionId,
                filterTransformer.transform(query.filter),
                filterTransformer.transformSort(sort),
                offset,
                limit,
                query.fields,
                returnTotalCount
            )

            const { items, totalCount } = await executeDataHooksFor(DataActions.AfterQuery, data, requestContextFor(Query, req.body), customContext)

            res.json({ items, pagingMetadata: { count: items.length, offset, total: totalCount } })
        } catch (e) {
            next(e)
        }
    })

    router.post('/v3/items/count', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionId, filter } = await executeDataHooksFor(DataActions.BeforeCount, dataPayloadFor(Count, req.body), requestContextFor(Count, req.body), customContext) as dataSource.CountRequest

            const data = await schemaAwareDataService.count(
                collectionId,
                filterTransformer.transform(filter),
            )

            const { totalCount } = await executeDataHooksFor(DataActions.AfterCount, data, requestContextFor(Count, req.body), customContext)

            res.json({ totalCount })
        } catch (e) {
            next(e)
        }
    })

    router.post('/v3/items/insert', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionId, items } = await executeDataHooksFor(DataActions.BeforeInsert, dataPayloadFor(Insert, req.body), requestContextFor(Insert, req.body), customContext) as dataSource.InsertRequest
            
            const data = await schemaAwareDataService.bulkInsert(collectionId, items)
            const dataAfterAction = await executeDataHooksFor(DataActions.AfterInsert, { results: data.items }, requestContextFor(Insert, req.body), customContext)


            res.json({ results: dataAfterAction.results })
        } catch (e) {
            next(e)
        }
    })

    router.post('/v3/items/update', async(req, res, next) => {
        
        try {
            const customContext = {}
            const { collectionId, items } = await executeDataHooksFor(DataActions.BeforeUpdate, dataPayloadFor(Update, req.body), requestContextFor(Update, req.body), customContext) as dataSource.UpdateRequest

            const data = await schemaAwareDataService.bulkUpdate(collectionId, items)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterUpdate, { results: data.items }, requestContextFor(Update, req.body), customContext)

            res.json({ results: dataAfterAction.results })
        } catch (e) {
            next(e)
        }
    })

    router.post('/v3/items/remove', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionId, itemIds } = await executeDataHooksFor(DataActions.BeforeRemove, dataPayloadFor(Remove, req.body), requestContextFor(Remove, req.body), customContext) as dataSource.RemoveRequest

            const data = await schemaAwareDataService.bulkDelete(collectionId, itemIds)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterRemove, { results: data.items }, requestContextFor(Remove, req.body), customContext)


            res.json({ results: dataAfterAction.results })
        } catch (e) {
            next(e)
        }
    })

    router.post('/v3/items/aggregate', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionId, initialFilter, aggregation, finalFilter, sort, paging, returnTotalCount } = await executeDataHooksFor(DataActions.BeforeAggregate,
                 dataPayloadFor(Aggregate, req.body), requestContextFor(Aggregate, req.body), customContext) as dataSource.AggregateRequest

            const offset = paging ? paging.offset : 0
            const limit = paging ? paging.limit : 50

            const data = await schemaAwareDataService.aggregate(collectionId, filterTransformer.transform(initialFilter), 
                                                                aggregationTransformer.transform({ aggregation, finalFilter }), 
                                                                filterTransformer.transformSort(sort), offset, limit, returnTotalCount)
                                                                
            const { items, totalCount: total } = await executeDataHooksFor(DataActions.AfterAggregate, data, requestContextFor(Aggregate, req.body), customContext)

            res.json({ items, pagingMetadata: { count: items.length, offset, total } })
        } catch (e) {            
            next(e)
        }
    })

    router.post('/v3/items/truncate', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionId } = await executeDataHooksFor(DataActions.BeforeTruncate, dataPayloadFor(Truncate, req.body), requestContextFor(Truncate, req.body), customContext) as dataSource.TruncateRequest
            
            await schemaAwareDataService.truncate(collectionId)
            await executeDataHooksFor(DataActions.AfterTruncate, {}, requestContextFor(Truncate, req.body), customContext)
            
            res.json({})
        } catch (e) {
            next(e)
        }
    })
    // ***********************************************

    // *************** Collections API **********************

    router.post('/v3/collections/get', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionIds } = await executeSchemaHooksFor(SchemaActions.BeforeGet, schemaPayloadFor(Get, req.body), requestContextFor(Get, req.body), customContext) as schemaSource.ListCollectionsRequest
            
            const data = await schemaService.list(collectionIds)
            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterGet, data, requestContextFor(Get, req.body), customContext)                     
            res.json({ collections: dataAfterAction.collections })
        } catch (e) {
            next(e)
        }
    })


    router.post('/v3/collections/create', async(req, res, next) => {
        try {
            const customContext = {}
            const { collection } = await executeSchemaHooksFor(SchemaActions.BeforeCreate, schemaPayloadFor(Create, req.body), requestContextFor(Create, req.body), customContext) as schemaSource.CreateCollectionRequest
            const data = await schemaService.create(collection)
            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterCreate, data, requestContextFor(Create, req.body), customContext)
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/v3/collections/update', async(req, res, next) => {
        try {
            const customContext = {}
            const { collection } = await executeSchemaHooksFor(SchemaActions.BeforeUpdate, schemaPayloadFor(UpdateSchema, req.body), requestContextFor(UpdateSchema, req.body), customContext) as schemaSource.UpdateCollectionRequest
            const data = await schemaService.update(collection)
            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterUpdate, data, requestContextFor(UpdateSchema, req.body), customContext)
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/v3/collections/delete', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionId } = await executeSchemaHooksFor(SchemaActions.BeforeDelete, schemaPayloadFor(Delete, req.body), requestContextFor(Delete, req.body), customContext) as schemaSource.DeleteCollectionRequest
            const data = await schemaService.delete(collectionId)
            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterDelete, data, requestContextFor(Delete, req.body), customContext)
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    // *************** Indexes API **********************

        router.post('/v3/indexes/list', async(req, res, next) => {
            try {
                const { collectionId } = req.body as ListIndexesRequest
                const indexes = await indexService.list(collectionId)
                res.json({ indexes })
            } catch (e) {
                next(e)
            }
        })
    
        router.post('/v3/indexes/create', async(req, res, next) => {
            try {
                const { collectionId, index } = req.body as CreateIndexRequest
                const createdIndex = await indexService.create(collectionId, index)
                res.json({
                    index: createdIndex
                })
            } catch (e) {
                next(e)
            }
        })
    
        router.post('/v3/indexes/remove', async(req, res, next) => {
            try {
                const { collectionId, indexName } = req.body as RemoveIndexRequest
                await indexService.remove(collectionId, indexName)
                res.json({})
            } catch (e) {
                next(e)
            }
        })
        // ***********************************************

    router.use(errorMiddleware(logger))

    return router
}
