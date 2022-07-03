const path = require('path')
const Promise = require('bluebird')
const express = require('express')
const compression = require('compression')
const { errorMiddleware } = require('./web/error-middleware')
const { appInfoFor } = require('./health/app_info')
const { InvalidRequest, ItemNotFound } = require('@wix-velo/velo-external-db-commons').errors
const { extractRole } = require('./web/auth-role-middleware')
const { config } = require('./roles-config.json')
const { secretKeyAuthMiddleware } = require('./web/auth-middleware')
const { authRoleMiddleware } = require('./web/auth-role-middleware')
const { unless, includes } = require('./web/middleware-support')
const { getAppInfoPage } = require('./utils/router_utils')
const { HooksForAction: DataHooksForAction, Operations: dataOperations, payloadFor: dataPayloadFor, Actions: DataActions, requestContextFor } = require('./data_hooks_utils')
const { HooksForAction: SchemaHooksForAction, Operations: SchemaOperations, payloadFor: schemaPayloadFor, Actions: SchemaActions } = require('./schema_hooks_utils')

const { Find: FIND, Insert: INSERT, BulkInsert: BULK_INSERT, Update: UPDATE, BulkUpdate: BULK_UPDATE, Remove: REMOVE, BulkRemove: BULK_REMOVE, Aggregate: AGGREGATE, Count: COUNT, Get: GET } = dataOperations

let schemaService, operationService, externalDbConfigClient, schemaAwareDataService, cfg, filterTransformer, aggregationTransformer, roleAuthorizationService, dataHooks, schemaHooks

const initServices = (_schemaAwareDataService, _schemaService, _operationService, _externalDbConfigClient, _cfg, _filterTransformer, _aggregationTransformer, _roleAuthorizationService, _hooks) => {
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

const serviceContext = () => ({
    dataService: schemaAwareDataService,
    schemaService
})


const executeDataHooksFor = async(action, payload, requestContext) => {
    return Promise.reduce(DataHooksForAction[action], async(lastHookResult, hook) => {
        return await executeHook(dataHooks, hook, lastHookResult, requestContext)
    }, payload)
}

const executeSchemaHooksFor = async(action, payload, requestContext) => {
    return Promise.reduce(SchemaHooksForAction[action], async(lastHookResult, hook) => {
        return await executeHook(schemaHooks, hook, lastHookResult, requestContext)
    }, payload)
}

const executeHook = async(hooks, actionName, payload, requestContext) => {
    if (hooks[actionName]) {
        try {
            const payloadAfterHook = await hooks[actionName](payload, requestContext, serviceContext())
            return payloadAfterHook || payload
        } catch (e) {
            if (e.status) throw e
            throw new InvalidRequest(e.message || e)
        }
    }
    return payload
}

const createRouter = () => {
    const router = express.Router()
    router.use(express.json())
    router.use(compression())
    router.use('/assets', express.static(path.join(__dirname, 'assets')))
    router.use(unless(['/', '/provision', '/favicon.ico'], secretKeyAuthMiddleware({ secretKey: cfg.secretKey })))

    config.forEach(({ pathPrefix, roles }) => router.use(includes([pathPrefix], authRoleMiddleware({ roles }))))

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
    router.post('/data/find', async(req, res, next) => {
        try {
            const { collectionName } = req.body

            const { filter, sort, skip, limit } = await executeDataHooksFor(DataActions.BeforeFind, dataPayloadFor(FIND, req.body), requestContextFor(FIND, req.body))

            await roleAuthorizationService.authorizeRead(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.find(collectionName, filterTransformer.transform(filter), sort, skip, limit)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterFind, data, requestContextFor(FIND, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/aggregate', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const { filter, processingStep, postFilteringStep } = await executeDataHooksFor(DataActions.BeforeAggregate, dataPayloadFor(AGGREGATE, req.body), requestContextFor(AGGREGATE, req.body))
            await roleAuthorizationService.authorizeRead(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.aggregate(collectionName, filterTransformer.transform(filter), aggregationTransformer.transform({ processingStep, postFilteringStep }))
            const dataAfterAction = await executeDataHooksFor(DataActions.AfterAggregate, data, requestContextFor(AGGREGATE, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })


    router.post('/data/insert', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const { item } = await executeDataHooksFor(DataActions.BeforeInsert, dataPayloadFor(INSERT, req.body), requestContextFor(INSERT, req.body))
            await roleAuthorizationService.authorizeWrite(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.insert(collectionName, item)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterInsert, data, requestContextFor(INSERT, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/insert/bulk', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const { items } = await executeDataHooksFor(DataActions.BeforeBulkInsert, dataPayloadFor(BULK_INSERT, req.body), requestContextFor(BULK_INSERT, req.body))

            await roleAuthorizationService.authorizeWrite(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.bulkInsert(collectionName, items)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterBulkInsert, data, requestContextFor(BULK_INSERT, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/get', async(req, res, next) => {
        try {
            const { collectionName } = req.body

            const { itemId } = await executeDataHooksFor(DataActions.BeforeGetById, dataPayloadFor(GET, req.body), requestContextFor(GET, req.body))
            await roleAuthorizationService.authorizeRead(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.getById(collectionName, itemId, '', 0, 1)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterGetById, data, requestContextFor(GET, req.body))
            if (!dataAfterAction.item) {
                throw new ItemNotFound('Item not found')
            }
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/update', async(req, res, next) => {
        try {
            const { collectionName } = req.body

            const { item } = await executeDataHooksFor(DataActions.BeforeUpdate, dataPayloadFor(UPDATE, req.body), requestContextFor(UPDATE, req.body))
            await roleAuthorizationService.authorizeWrite(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.update(collectionName, item)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterUpdate, data, requestContextFor(UPDATE, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/update/bulk', async(req, res, next) => {
        try {
            const { collectionName } = req.body

            const { items } = await executeDataHooksFor(DataActions.BeforeBulkUpdate, dataPayloadFor(BULK_UPDATE, req.body), requestContextFor(BULK_UPDATE, req.body))
            await roleAuthorizationService.authorizeWrite(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.bulkUpdate(collectionName, items)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterBulkUpdate, data, requestContextFor(BULK_UPDATE, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/remove', async(req, res, next) => {
        try {
            const { collectionName } = req.body

            const { itemId } = await executeDataHooksFor(DataActions.BeforeRemove, dataPayloadFor(REMOVE, req.body), requestContextFor(REMOVE, req.body))
            await roleAuthorizationService.authorizeWrite(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.delete(collectionName, itemId)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterRemove, data, requestContextFor(REMOVE, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/remove/bulk', async(req, res, next) => {
        try {
            const { collectionName } = req.body

            const { itemIds } = await executeDataHooksFor(DataActions.BeforeBulkRemove, dataPayloadFor(BULK_REMOVE, req.body), requestContextFor(BULK_REMOVE, req.body))
            await roleAuthorizationService.authorizeWrite(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.bulkDelete(collectionName, itemIds)

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterBulkRemove, data, requestContextFor(BULK_REMOVE, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/count', async(req, res, next) => {
        try {
            const { collectionName } = req.body

            const { filter } = await executeDataHooksFor(DataActions.BeforeCount, dataPayloadFor(COUNT, req.body), requestContextFor(COUNT, req.body))
            await roleAuthorizationService.authorizeRead(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.count(collectionName, filterTransformer.transform(filter))

            const dataAfterAction = await executeDataHooksFor(DataActions.AfterCount, data, requestContextFor(COUNT, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/truncate', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            await roleAuthorizationService.authorizeWrite(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.truncate(collectionName)
            res.json(data)
        } catch (e) {
            next(e)
        }
    })
    // ***********************************************


    // *************** Schema API **********************
    router.post('/schemas/list', async(req, res, next) => {
        try {
            await executeSchemaHooksFor(SchemaActions.BeforeList, schemaPayloadFor(SchemaOperations.List, req.body), requestContextFor(SchemaOperations.List, req.body))
            const data = await schemaService.list()

            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterList, data, requestContextFor(SchemaOperations.List, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/list/headers', async(req, res, next) => {
        try {
            await executeSchemaHooksFor(SchemaActions.BeforeListHeaders, schemaPayloadFor(SchemaOperations.ListHeaders, req.body), requestContextFor(SchemaOperations.ListHeaders, req.body))
            const data = await schemaService.listHeaders()

            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterListHeaders, data, requestContextFor(SchemaOperations.ListHeaders, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/find', async(req, res, next) => {
        try {
            const { schemaIds } = await executeSchemaHooksFor(SchemaActions.BeforeFind, schemaPayloadFor(SchemaOperations.Find, req.body), requestContextFor(SchemaOperations.Find, req.body))

            if (schemaIds && schemaIds.length > 10) {
                throw new InvalidRequest()
            }
            const data = await schemaService.find(schemaIds)
            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterFind, data, requestContextFor(SchemaOperations.Find, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/create', async(req, res, next) => {
        try {
            const { collectionName } = await executeSchemaHooksFor(SchemaActions.BeforeCreate, schemaPayloadFor(SchemaOperations.Create, req.body), requestContextFor(SchemaOperations.Create, req.body))
            const data = await schemaService.create(collectionName)

            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterCreate, data, requestContextFor(SchemaOperations.Create, req.body))

            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/column/add', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const { column } = await executeSchemaHooksFor(SchemaActions.BeforeColumnAdd, schemaPayloadFor(SchemaOperations.ColumnAdd, req.body), requestContextFor(SchemaOperations.ColumnAdd, req.body))

            const data = await schemaService.addColumn(collectionName, column)

            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterColumnAdd, data, requestContextFor(SchemaOperations.ColumnAdd, req.body))

            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/column/remove', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const { columnName } = await executeSchemaHooksFor(SchemaActions.BeforeColumnRemove, schemaPayloadFor(SchemaOperations.ColumnRemove, req.body), requestContextFor(SchemaOperations.ColumnRemove, req.body))

            const data = await schemaService.removeColumn(collectionName, columnName)

            const dataAfterAction = await executeSchemaHooksFor(SchemaActions.AfterColumnRemove, data, requestContextFor(SchemaOperations.ColumnRemove, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })
    // ***********************************************

    router.use(errorMiddleware)

    return router
}
module.exports = { createRouter, initServices }
