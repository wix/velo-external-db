import * as path from 'path'
import * as BPromise from 'bluebird'
import * as express from 'express'
import type { Response } from 'express'
import * as compression from 'compression'
import { errorMiddleware } from './web/error-middleware'
import { appInfoFor } from './health/app_info'
import { errors } from '@wix-velo/velo-external-db-commons'
import { extractRole } from './web/auth-role-middleware'
import { config } from './roles-config.json'
import { authRoleMiddleware } from './web/auth-role-middleware'
import { unless, includes } from './web/middleware-support'
import { getAppInfoPage } from './utils/router_utils'
import { DataHooksForAction, DataOperations, dataPayloadFor, DataActions, requestContextFor } from './data_hooks_utils'
// import { SchemaHooksForAction } from './schema_hooks_utils'
import SchemaService from './service/schema'
import OperationService from './service/operation'
import { AnyFixMe, Item } from '@wix-velo/velo-external-db-types'
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


const { InvalidRequest } = errors
// const { Find: FIND, Insert: INSERT, BulkInsert: BULK_INSERT, Update: UPDATE, BulkUpdate: BULK_UPDATE, Remove: REMOVE, BulkRemove: BULK_REMOVE, Aggregate: AGGREGATE, Count: COUNT, Get: GET } = DataOperations
const { Aggregate: AGGREGATE } = DataOperations

let schemaService: SchemaService, operationService: OperationService, externalDbConfigClient: ConfigValidator, schemaAwareDataService: SchemaAwareDataService, cfg: { externalDatabaseId: string, allowedMetasites: string, type?: any; vendor?: any, wixDataBaseUrl: string }, filterTransformer: FilterTransformer, aggregationTransformer: AggregationTransformer, roleAuthorizationService: RoleAuthorizationService, dataHooks: DataHooks //schemaHooks: SchemaHooks

export const initServices = (_schemaAwareDataService: SchemaAwareDataService, _schemaService: SchemaService, _operationService: OperationService,
                             _externalDbConfigClient: ConfigValidator, _cfg: { externalDatabaseId: string, allowedMetasites: string, type?: string, vendor?: string, wixDataBaseUrl: string },
                             _filterTransformer: FilterTransformer, _aggregationTransformer: AggregationTransformer,
                             _roleAuthorizationService: RoleAuthorizationService, _hooks?: Hooks) => {
    schemaService = _schemaService
    operationService = _operationService
    externalDbConfigClient = _externalDbConfigClient
    cfg = _cfg
    schemaAwareDataService = _schemaAwareDataService
    filterTransformer = _filterTransformer
    aggregationTransformer = _aggregationTransformer
    roleAuthorizationService = _roleAuthorizationService
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

// const executeSchemaHooksFor = async(action: string, payload: any, requestContext: RequestContext, customContext: any) => {
//     return BPromise.reduce(SchemaHooksForAction[action], async(lastHookResult: any, hookName: string) => {
//         return await executeHook(schemaHooks, hookName, lastHookResult, requestContext, customContext)
//     }, payload)
// }

const executeHook = async(hooks: DataHooks | SchemaHooks, _actionName: string, payload: AnyFixMe, requestContext: RequestContext, customContext: any) => {
    const actionName = _actionName as keyof typeof hooks
    if (hooks[actionName]) {
        try {
            // @ts-ignore
            const payloadAfterHook = await hooks[actionName](payload, requestContext, serviceContext(), customContext)
            return payloadAfterHook || payload
        } catch (e: any) {
            if (e.status) throw e
            throw new InvalidRequest(e.message || e)
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
    

    // *************** INFO **********************
    router.get('/', async(req, res) => {
        const appInfo = await appInfoFor(operationService, externalDbConfigClient)
        const appInfoPage = await getAppInfoPage(appInfo)

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
            const queryRequest: dataSource.QueryRequest = req.body
            const query = queryRequest.query

            const offset = query.paging ? query.paging.offset : 0
            const limit = query.paging ? query.paging.limit : 50

            const data = await schemaAwareDataService.find(
                queryRequest.collectionId,
                filterTransformer.transform(query.filter),
                filterTransformer.transformSort(query.sort),
                offset,
                limit,
                query.fields,
                queryRequest.omitTotalCount
            )

            const responseParts = data.items.map(dataSource.QueryResponsePart.item)
            const metadata = dataSource.QueryResponsePart.pagingMetadata(responseParts.length, offset, data.totalCount)

            streamCollection([...responseParts, ...[metadata]], res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/count', async(req, res, next) => {
        try {
            const countRequest: dataSource.CountRequest = req.body

            const data = await schemaAwareDataService.count(
                countRequest.collectionId,
                filterTransformer.transform(countRequest.filter),
            )

            const response = {
                totalCount: data.totalCount
            } as dataSource.CountResponse

            res.json(response)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/insert', async(req, res, next) => {
        try {
            const insertRequest: dataSource.InsertRequest = req.body

            const collectionName = insertRequest.collectionId

            const data = insertRequest.overwriteExisting ?
                            await schemaAwareDataService.bulkUpsert(collectionName, insertRequest.items) :
                            await schemaAwareDataService.bulkInsert(collectionName, insertRequest.items)

            const responseParts = data.items.map(dataSource.InsertResponsePart.item)

            streamCollection(responseParts, res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/update', async(req, res, next) => {
        
        try {
            const updateRequest: dataSource.UpdateRequest = req.body

            const collectionName = updateRequest.collectionId

            const data = await schemaAwareDataService.bulkUpdate(collectionName, updateRequest.items)

            const responseParts = data.items.map(dataSource.UpdateResponsePart.item)

            streamCollection(responseParts, res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/remove', async(req, res, next) => {
        try {
            const removeRequest: dataSource.RemoveRequest = req.body
            const collectionName = removeRequest.collectionId
            const idEqExpression = removeRequest.itemIds.map(itemId => ({ _id: { $eq: itemId } }))
            const filter = { $or: idEqExpression }

            const objectsBeforeRemove = (await schemaAwareDataService.find(collectionName, filterTransformer.transform(filter), undefined, 0, removeRequest.itemIds.length)).items

            await schemaAwareDataService.bulkDelete(collectionName, removeRequest.itemIds)

            const responseParts = objectsBeforeRemove.map(dataSource.RemoveResponsePart.item)

            streamCollection(responseParts, res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/aggregate', async(req, res, next) => {
        try {
            const aggregationRequest = req.body as dataSource.AggregateRequest
            const { collectionId, paging, sort } = aggregationRequest
            const offset = paging ? paging.offset : 0
            const limit = paging ? paging.limit : 50

            const customContext = {}
            const { initialFilter, group, finalFilter } = await executeDataHooksFor(DataActions.BeforeAggregate, dataPayloadFor(AGGREGATE, aggregationRequest), requestContextFor(AGGREGATE, aggregationRequest), customContext)
            roleAuthorizationService.authorizeRead(collectionId, extractRole(aggregationRequest))
            const data = await schemaAwareDataService.aggregate(collectionId, filterTransformer.transform(initialFilter), aggregationTransformer.transform({ group, finalFilter }), filterTransformer.transformSort(sort), offset, limit)
            const dataAfterAction = await executeDataHooksFor(DataActions.AfterAggregate, data, requestContextFor(AGGREGATE, aggregationRequest), customContext)

            const responseParts = dataAfterAction.items.map(dataSource.AggregateResponsePart.item)
            const metadata = dataSource.AggregateResponsePart.pagingMetadata((dataAfterAction.items as Item[]).length, offset, data.totalCount)

            streamCollection([...responseParts, ...[metadata]], res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/truncate', async(req, res, next) => {
        try {
            const trancateRequest = req.body as dataSource.TruncateRequest
            await schemaAwareDataService.truncate(trancateRequest.collectionId)
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
            const data = await schemaService.list(collectionIds)
            streamCollection(data.collection, res)
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
