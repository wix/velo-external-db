import * as path from 'path'
import * as BPromise from 'bluebird'
import * as express from 'express'
import type {Response} from 'express';
import * as compression from 'compression'
import { errorMiddleware } from './web/error-middleware'
import { appInfoFor } from './health/app_info'
import { errors } from '@wix-velo/velo-external-db-commons'
import { extractRole } from './web/auth-role-middleware'
import { config } from './roles-config.json'
import { secretKeyAuthMiddleware } from './web/auth-middleware'
import { authRoleMiddleware } from './web/auth-role-middleware'
import { unless, includes } from './web/middleware-support'
import { getAppInfoPage } from './utils/router_utils'
import { DataHooksForAction, DataOperations, dataPayloadFor, DataActions, requestContextFor } from './data_hooks_utils'
import { SchemaHooksForAction, SchemaOperations, schemaPayloadFor, SchemaActions } from './schema_hooks_utils'
import SchemaService from './service/schema'
import OperationService from './service/operation'
import { AnyFixMe } from '@wix-velo/velo-external-db-types'
import SchemaAwareDataService from './service/schema_aware_data'
import FilterTransformer from './converters/filter_transformer'
import AggregationTransformer from './converters/aggregation_transformer'
import { RoleAuthorizationService } from '@wix-velo/external-db-security'
import { DataHooks, Hooks, RequestContext, SchemaHooks, ServiceContext } from './types'
import { ConfigValidator } from '@wix-velo/external-db-config'
import * as dataSource from './spi-model/data_source'
import { json } from 'stream/consumers';
import DataService from './service/data';


const { InvalidRequest, ItemNotFound } = errors
const { Find: FIND, Insert: INSERT, BulkInsert: BULK_INSERT, Update: UPDATE, BulkUpdate: BULK_UPDATE, Remove: REMOVE, BulkRemove: BULK_REMOVE, Aggregate: AGGREGATE, Count: COUNT, Get: GET } = DataOperations

let schemaService: SchemaService, operationService: OperationService, externalDbConfigClient: ConfigValidator, schemaAwareDataService: SchemaAwareDataService, cfg: { secretKey?: any; type?: any; vendor?: any }, filterTransformer: FilterTransformer, aggregationTransformer: AggregationTransformer, roleAuthorizationService: RoleAuthorizationService, dataHooks: DataHooks, schemaHooks: SchemaHooks

export const initServices = (_schemaAwareDataService: SchemaAwareDataService, _schemaService: SchemaService, _operationService: OperationService,
                             _externalDbConfigClient: ConfigValidator, _cfg: { secretKey?: string, type?: string, vendor?: string },
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
    schemaHooks = _hooks?.schemaHooks || {}
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

const executeSchemaHooksFor = async(action: string, payload: any, requestContext: RequestContext, customContext: any) => {
    return BPromise.reduce(SchemaHooksForAction[action], async(lastHookResult: any, hookName: string) => {
        return await executeHook(schemaHooks, hookName, lastHookResult, requestContext, customContext)
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
    router.use(unless(['/', '/provision', '/favicon.ico'], secretKeyAuthMiddleware({ secretKey: cfg.secretKey })))

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

    router.post('/provision', async(req, res) => {
        const { type, vendor } = cfg
        res.json({ type, vendor, protocolVersion: 2 })
    })

    // *************** Data API **********************
    router.post('/data/query', async(req, res, next) => {
        const queryRequest: dataSource.QueryRequest = req.body;
        const query = queryRequest.query

        const offset = query.paging? query.paging.offset: 0
        const limit = query.paging? query.paging.limit: 50

        const data = await schemaAwareDataService.find(
            queryRequest.collectionId, 
            filterTransformer.transform(query.filter), 
            query.sort, 
            offset, 
            limit, 
            query.fields,
            queryRequest.omitTotalCount
        )

        const responseParts = data.items.map(dataSource.QueryResponsePart.item)

        const metadata = dataSource.QueryResponsePart.pagingMetadata(responseParts.length, offset, data.totalCount)

        streamCollection([...responseParts, ...[metadata]], res)
    })


    router.post('/data/count', async(req, res, next) => {
        const countRequest: dataSource.CountRequest = req.body;
        
        const data = await schemaAwareDataService.count(
            countRequest.collectionId, 
            filterTransformer.transform(countRequest.filter), 
        )

        const response = {
            totalCount: data.totalCount
        } as dataSource.CountResponse

        res.json(response)
    })

    router.post('/data2/aggregate', async(req, res, next) => {
        const aggregateRequest: dataSource.AggregateRequest = req.body;
        


        const data = await schemaAwareDataService.aggregate(
            aggregateRequest.collectionId,
            filterTransformer.transform(aggregateRequest.initialFilter),
            {
                projection: [],
                postFilter: aggregateRequest.finalFilter,
            }
        )

        res.json(data)
    })

    router.post('/data/insert', async(req, res, next) => {
        try {
            const insertRequest: dataSource.InsertRequest = req.body;

            const collectionName = insertRequest.collectionId

            const data = insertRequest.overwriteExisting ? 
                            await schemaAwareDataService.bulkUpsert(collectionName, insertRequest.items) : 
                            await schemaAwareDataService.bulkInsert(collectionName, insertRequest.items)

            const responseParts = data.items.map(item => ({
                    item: item
                } as dataSource.InsertResponsePart
            ))

            streamCollection(responseParts, res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/update', async(req, res, next) => {
        
        try {
            const updateRequest: dataSource.UpdateRequest = req.body;

            const collectionName = updateRequest.collectionId

            const data = await schemaAwareDataService.bulkUpdate(collectionName, updateRequest.items)

            const responseParts = data.items.map(item => ({
                    item: item
                } as dataSource.UpdateResponsePart
            ))

            streamCollection(responseParts, res)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/remove', async(req, res, next) => {
        try {
            const removeRequest: dataSource.RemoveRequest = req.body;
            const collectionName = removeRequest.collectionId

            const idEqExpression = removeRequest.itemIds.map(itemId => ({_id: {$eq: itemId}}))
            const filter = {$or: idEqExpression}

            const objectsBeforeRemove = (await schemaAwareDataService.find(collectionName, filterTransformer.transform(filter), undefined, 0, removeRequest.itemIds.length)).items

            const data = await schemaAwareDataService.bulkDelete(collectionName, removeRequest.itemIds)
            
            const responseParts = objectsBeforeRemove.map(item => ({
                    item: item
                } as dataSource.RemoveResponsePart
            ))

            streamCollection(responseParts, res)
        } catch (e) {
            next(e)
        }
    })    

    router.post('/data/aggregate', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const customContext = {}
            const { filter, processingStep, postFilteringStep } = await executeDataHooksFor(DataActions.BeforeAggregate, dataPayloadFor(AGGREGATE, req.body), requestContextFor(AGGREGATE, req.body), customContext)
            await roleAuthorizationService.authorizeRead(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.aggregate(collectionName, filterTransformer.transform(filter), aggregationTransformer.transform({ processingStep, postFilteringStep }))
            const dataAfterAction = await executeDataHooksFor(DataActions.AfterAggregate, data, requestContextFor(AGGREGATE, req.body), customContext)
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/get', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const customContext = {}
            const { itemId, projection } = await executeDataHooksFor(DataActions.BeforeGetById, dataPayloadFor(GET, req.body), requestContextFor(GET, req.body), customContext)
            await roleAuthorizationService.authorizeRead(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.getById(collectionName, itemId, projection)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterGetById, data, requestContextFor(GET, req.body), customContext)
            if (!dataAfterAction.item) {
                throw new ItemNotFound('Item not found')
            }
            res.json(dataAfterAction)
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


    // *************** Schema API **********************
    router.post('/schemas/list', async(req, res, next) => {
        try {
            const customContext = {}
            await executeSchemaHooksFor(SchemaActions.BeforeList, schemaPayloadFor(SchemaOperations.List, req.body), requestContextFor(SchemaOperations.List, req.body), customContext)

            const data = await schemaService.list()

            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterList, data, requestContextFor(SchemaOperations.List, req.body), customContext)
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/list/headers', async(req, res, next) => {
        try {
            const customContext = {}
            await executeSchemaHooksFor(SchemaActions.BeforeListHeaders, schemaPayloadFor(SchemaOperations.ListHeaders, req.body), requestContextFor(SchemaOperations.ListHeaders, req.body), customContext)
            const data = await schemaService.listHeaders()

            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterListHeaders, data, requestContextFor(SchemaOperations.ListHeaders, req.body), customContext)
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/find', async(req, res, next) => {
        try {
            const customContext = {}
            const { schemaIds } = await executeSchemaHooksFor(SchemaActions.BeforeFind, schemaPayloadFor(SchemaOperations.Find, req.body), requestContextFor(SchemaOperations.Find, req.body), customContext)

            if (schemaIds && schemaIds.length > 10) {
                throw new InvalidRequest('Too many schemas requested')
            }
            const data = await schemaService.find(schemaIds)
            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterFind, data, requestContextFor(SchemaOperations.Find, req.body), customContext)
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/create', async(req, res, next) => {
        try {
            const customContext = {}
            const { collectionName } = await executeSchemaHooksFor(SchemaActions.BeforeCreate, schemaPayloadFor(SchemaOperations.Create, req.body), requestContextFor(SchemaOperations.Create, req.body), customContext)
            const data = await schemaService.create(collectionName)

            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterCreate, data, requestContextFor(SchemaOperations.Create, req.body), customContext)

            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/column/add', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const customContext = {}
            const { column } = await executeSchemaHooksFor(SchemaActions.BeforeColumnAdd, schemaPayloadFor(SchemaOperations.ColumnAdd, req.body), requestContextFor(SchemaOperations.ColumnAdd, req.body), customContext)

            const data = await schemaService.addColumn(collectionName, column)

            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterColumnAdd, data, requestContextFor(SchemaOperations.ColumnAdd, req.body), customContext)

            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/column/remove', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const customContext = {}
            const { columnName } = await executeSchemaHooksFor(SchemaActions.BeforeColumnRemove, schemaPayloadFor(SchemaOperations.ColumnRemove, req.body), requestContextFor(SchemaOperations.ColumnRemove, req.body), customContext)

            const data = await schemaService.removeColumn(collectionName, columnName)

            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterColumnRemove, data, requestContextFor(SchemaOperations.ColumnRemove, req.body), customContext)
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })
    // ***********************************************

    router.use(errorMiddleware)

    return router
}
