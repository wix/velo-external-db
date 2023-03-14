import * as path from 'path'
import * as BPromise from 'bluebird'
import * as express from 'express'
import type { Response } from 'express'
import * as compression from 'compression'
import { errorMiddleware } from './web/error-middleware'
import { appInfoFor } from './health/app_info'
import { errors } from '@wix-velo/velo-external-db-commons'

import { config } from './roles-config.json'
import { authRoleMiddleware } from './web/auth-role-middleware'
import { unless, includes } from './web/middleware-support'
import { getAppInfoPage } from './utils/router_utils'
import { requestContextFor, DataActions, dataPayloadFor, DataHooksForAction } from './data_hooks_utils'
// import { SchemaHooksForAction } from './schema_hooks_utils'
import SchemaService from './service/schema'
import OperationService from './service/operation'
import { AnyFixMe, DataOperation, Item } from '@wix-velo/velo-external-db-types'
import SchemaAwareDataService from './service/schema_aware_data'
import FilterTransformer from './converters/filter_transformer'
import AggregationTransformer from './converters/aggregation_transformer'
import { RoleAuthorizationService } from '@wix-velo/external-db-security'
import { DataHooks, Hooks, RequestContext, SchemaHooks, ServiceContext } from './types'
import { ConfigValidator } from '@wix-velo/external-db-config'
import { JwtAuthenticator } from './web/jwt-auth-middleware'
import * as dataSource from './spi-model/data_source'
import * as capabilities from './spi-model/capabilities'
import { WixDataFacade } from './web/wix_data_facade'

const { query: Query, count: Count, aggregate: Aggregate, insert: Insert, update: Update, remove: Remove, truncate: Truncate } = DataOperation

let schemaService: SchemaService, operationService: OperationService, externalDbConfigClient: ConfigValidator, schemaAwareDataService: SchemaAwareDataService, cfg: { externalDatabaseId: string, allowedMetasites: string, type?: any; vendor?: any, wixDataBaseUrl: string, hideAppInfo?: boolean }, filterTransformer: FilterTransformer, aggregationTransformer: AggregationTransformer,  dataHooks: DataHooks //roleAuthorizationService: RoleAuthorizationService, schemaHooks: SchemaHooks,

export const initServices = (_schemaAwareDataService: SchemaAwareDataService, _schemaService: SchemaService, _operationService: OperationService,
                             _externalDbConfigClient: ConfigValidator, _cfg: { externalDatabaseId: string, allowedMetasites: string, type?: string, vendor?: string, wixDataBaseUrl: string, hideAppInfo?: boolean },
                             _filterTransformer: FilterTransformer, _aggregationTransformer: AggregationTransformer,
                             _roleAuthorizationService: RoleAuthorizationService, _hooks: Hooks) => {
    schemaService = _schemaService
    operationService = _operationService
    externalDbConfigClient = _externalDbConfigClient
    cfg = _cfg
    schemaAwareDataService = _schemaAwareDataService
    filterTransformer = _filterTransformer
    aggregationTransformer = _aggregationTransformer
    // roleAuthorizationService = _roleAuthorizationService
    dataHooks = _hooks?.dataHooks || {}
    // schemaHooks = _hooks?.schemaHooks || {}
}

const serviceContext = (): ServiceContext => ({
    dataService: schemaAwareDataService,
    schemaService
})


const executeDataHooksFor = async(action: string, payload: AnyFixMe, requestContext: RequestContext, customContext: any) => {
    return BPromise.reduce(DataHooksForAction[action], async(lastHookResult: AnyFixMe, hookName: string) => {
        return await executeHook(dataHooks, hookName, lastHookResult, requestContext, customContext)
    }, payload)
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
    router.use(express.json())
    router.use(compression())
    router.use('/assets', express.static(path.join(__dirname, 'assets')))
    const jwtAuthenticator = new JwtAuthenticator(cfg.externalDatabaseId, cfg.allowedMetasites, new WixDataFacade(cfg.wixDataBaseUrl))
    router.use(unless(['/', '/info', '/capabilities', '/favicon.ico'], jwtAuthenticator.authorizeJwt()))

    config.forEach(({ pathPrefix, roles }) => router.use(includes([pathPrefix], authRoleMiddleware({ roles }))))

    const streamCollection = (collection: any[], res: Response) => {
        res.contentType('application/x-ndjson')
        collection.forEach(item => {
            res.write(JSON.stringify(item))
        })
        res.end()
    }

    const getItemsOneByOne = (collectionName: string, itemIds: string[]): Promise<any[]> => {
        const idEqExpression = itemIds.map(itemId => ({ _id: { $eq: itemId } }))
        return Promise.all(
            idEqExpression.map(eqExp => schemaAwareDataService.find(collectionName, filterTransformer.transform(eqExp), undefined, 0, 1).then(r => r.items[0]))
        )
    }

    // *************** INFO **********************
    router.get('/', async(req, res) => {
        const { hideAppInfo } = cfg
        const appInfo = await appInfoFor(operationService, externalDbConfigClient, cfg.hideAppInfo)
        const appInfoPage = await getAppInfoPage(appInfo, hideAppInfo) 

        res.send(appInfoPage)
    })

    router.get('/capabilities', async(req, res) => {
        const capabilitiesResponse = {
            capabilities: {
                collection: [capabilities.CollectionCapability.CREATE]
            } as capabilities.Capabilities
        } as capabilities.GetCapabilitiesResponse

        res.json(capabilitiesResponse)
    })

    router.post('/provision', async(req, res) => {
        const { type, vendor } = cfg
        res.json({ type, vendor, protocolVersion: 3, adapterVersion: 'v1' })
    })

    router.get('/info', async(req, res) => {
        const { externalDatabaseId } = cfg
        res.json({ dataSourceId: externalDatabaseId })
    })

    // *************** Data API **********************
    router.post('/data/query', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionId, query, omitTotalCount } = await executeDataHooksFor(DataActions.BeforeQuery, dataPayloadFor(Query, req.body), requestContextFor(Query, req.body), customContext) as dataSource.QueryRequest

            const offset = query.paging ? query.paging.offset : 0
            const limit = query.paging ? query.paging.limit : 50

            const data = await schemaAwareDataService.find(
                collectionId,
                filterTransformer.transform(query.filter),
                filterTransformer.transformSort(query.sort),
                offset,
                limit,
                query.fields,
                omitTotalCount
            )

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterQuery, data, requestContextFor(Query, req.body), customContext)
            const responseParts = dataAfterAction.items.map(dataSource.QueryResponsePart.item)

            const metadata = dataSource.QueryResponsePart.pagingMetadata(responseParts.length, offset, dataAfterAction.totalCount)

            streamCollection([...responseParts, ...[metadata]], res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/count', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionId, filter } = await executeDataHooksFor(DataActions.BeforeCount, dataPayloadFor(Count, req.body), requestContextFor(Count, req.body), customContext) as dataSource.CountRequest

            const data = await schemaAwareDataService.count(
                collectionId,
                filterTransformer.transform(filter),
            )

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterCount, data, requestContextFor(Count, req.body), customContext)

            const response = {
                totalCount: dataAfterAction.totalCount
            } as dataSource.CountResponse

            res.json(response)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/insert', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionId, items, overwriteExisting } = await executeDataHooksFor(DataActions.BeforeInsert, dataPayloadFor(Insert, req.body), requestContextFor(Insert, req.body), customContext) as dataSource.InsertRequest

            const data = overwriteExisting ?
                            await schemaAwareDataService.bulkUpsert(collectionId, items) :
                            await schemaAwareDataService.bulkInsert(collectionId, items)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterInsert, data, requestContextFor(Insert, req.body), customContext)
            const responseParts = dataAfterAction.items.map(dataSource.InsertResponsePart.item)

            streamCollection(responseParts, res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/update', async(req, res, next) => {
        
        try {
            const customContext = {}
            const { collectionId, items } = await executeDataHooksFor(DataActions.BeforeUpdate, dataPayloadFor(Update, req.body), requestContextFor(Update, req.body), customContext) as dataSource.UpdateRequest

            const data = await schemaAwareDataService.bulkUpdate(collectionId, items)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterUpdate, data, requestContextFor(Update, req.body), customContext)

            const responseParts = dataAfterAction.items.map(dataSource.UpdateResponsePart.item)

            streamCollection(responseParts, res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/remove', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionId, itemIds } = await executeDataHooksFor(DataActions.BeforeRemove, dataPayloadFor(Remove, req.body), requestContextFor(Remove, req.body), customContext) as dataSource.RemoveRequest

            const objectsBeforeRemove = await getItemsOneByOne(collectionId, itemIds)

            await schemaAwareDataService.bulkDelete(collectionId, itemIds)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterRemove, { items: objectsBeforeRemove }, requestContextFor(Remove, req.body), customContext)

            const responseParts = dataAfterAction.items.map(dataSource.RemoveResponsePart.item)

            streamCollection(responseParts, res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/aggregate', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionId, initialFilter, group, finalFilter, sort, paging } = await executeDataHooksFor(DataActions.BeforeAggregate, dataPayloadFor(Aggregate, req.body), requestContextFor(Aggregate, req.body), customContext) as dataSource.AggregateRequest

            const offset = paging ? paging.offset : 0
            const limit = paging ? paging.limit : 50

            const data = await schemaAwareDataService.aggregate(collectionId, filterTransformer.transform(initialFilter), aggregationTransformer.transform({ group, finalFilter }), filterTransformer.transformSort(sort), offset, limit)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterAggregate, data, requestContextFor(Aggregate, req.body), customContext)

            const responseParts = dataAfterAction.items.map(dataSource.AggregateResponsePart.item)
            const metadata = dataSource.AggregateResponsePart.pagingMetadata((dataAfterAction.items as Item[]).length, offset, data.totalCount)

            streamCollection([...responseParts, ...[metadata]], res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/truncate', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionId } = await executeDataHooksFor(DataActions.BeforeTruncate, dataPayloadFor(Truncate, req.body), requestContextFor(Truncate, req.body), customContext) as dataSource.TruncateRequest
            await schemaAwareDataService.truncate(collectionId)
            await executeDataHooksFor(DataActions.AfterTruncate, {}, requestContextFor(Truncate, req.body), customContext)
            res.json({} as dataSource.TruncateResponse)
        } catch (e) {
            next(e)
        }
    })
    // ***********************************************

    // *************** Collections API **********************

    router.post('/collections/get', async(req, res, next) => {

        const { collectionIds } = req.body
        try {
            const collectionsList = await schemaService.list(collectionIds)
            streamCollection(collectionsList, res)
        } catch (e) {
            next(e)
        }
    })


    router.post('/collections/create', async(req, res, next) => {
        const { collection } = req.body

        try {
            const data = await schemaService.create(collection)
            streamCollection([data.collection], res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/collections/update', async(req, res, next) => {
        const { collection } = req.body

        try {
            const data = await schemaService.update(collection)
            streamCollection([data.collection], res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/collections/delete', async(req, res, next) => {
        const { collectionId } = req.body

        try {
            const data = await schemaService.delete(collectionId)
            streamCollection([data.collection], res)
        } catch (e) {
            next(e)
        }
    })


    router.use(errorMiddleware)

    return router
}
