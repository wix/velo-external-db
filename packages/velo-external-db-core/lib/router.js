const express = require('express')
const { errorMiddleware } = require('./web/error-middleware')
const { appInfoFor } = require('./health/app_info')
const { InvalidRequest, ItemNotFound } = require('velo-external-db-commons').errors
const { extractRole } = require('./web/auth-role-middleware')
const { config } = require('./roles-config.json')
const compression = require('compression')
const { secretKeyAuthMiddleware } = require('./web/auth-middleware')
const { authRoleMiddleware } = require('./web/auth-role-middleware')
const { unless, includes } = require('./web/middleware-support')
const path = require('path')
const { hooksForAction, Operations, payloadFor, Actions, requestContextFor } = require('./hooks_utils')
const { FIND, INSERT, BULK_INSERT, UPDATE, BULK_UPDATE, REMOVE, BULK_REMOVE, AGGREGATE, COUNT, GET } = Operations

let schemaService, operationService, externalDbConfigClient, schemaAwareDataService, cfg, filterTransformer, aggregationTransformer, roleAuthorizationService, hooks

let appInfoEnabled = false
const enableAppInfo = () => appInfoEnabled = true

const initServices = (_schemaAwareDataService, _schemaService, _operationService, _externalDbConfigClient, _cfg, _filterTransformer, _aggregationTransformer, _roleAuthorizationService, _hooks) => {
    schemaService = _schemaService
    operationService = _operationService
    externalDbConfigClient = _externalDbConfigClient
    cfg = _cfg
    schemaAwareDataService = _schemaAwareDataService
    filterTransformer = _filterTransformer
    aggregationTransformer = _aggregationTransformer
    roleAuthorizationService = _roleAuthorizationService
    hooks = _hooks || {}
}

const serviceContext = {
    schemaAwareDataService,
    schemaService
}


const executeHooksFor = async(action, payload, requestContext) => {
    let result = payload
    for (const hook of hooksForAction(action)) {
        result = await executeHook(hook, result, requestContext)
    }
    return result
}

const executeHook = async(actionName, payload, requestContext) => {
    if (hooks[actionName]) {
        try {
            const payloadAfterHook = await hooks[actionName](payload, requestContext, serviceContext)
            return payloadAfterHook || payload
        } catch (e) {
            throw ({ status: 400, message: e })
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
        appInfoEnabled ? res.render('index', appInfo) : res.json(appInfo)
    })

    router.post('/provision', async(req, res) => {
        const { type, vendor } = cfg
        res.json({ type, vendor, protocolVersion: 2 })
    })

    // *************** Data API **********************
    router.post('/data/find', async(req, res, next) => {
        try {
            const { collectionName } = req.body

            const { filter, sort, skip, limit } = await executeHooksFor(Actions.BeforeFind, payloadFor(FIND, req.body), requestContextFor(FIND, req.body))
            await roleAuthorizationService.authorizeRead(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.find(collectionName, filterTransformer.transform(filter), sort, skip, limit)

            const dataAfterAction = await executeHooksFor(Actions.AfterFind, data, requestContextFor(FIND, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/aggregate', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const { filter, processingStep, postFilteringStep } = await executeHooksFor(Actions.BeforeAggregate, payloadFor(AGGREGATE, req.body), requestContextFor(AGGREGATE, req.body))
            await roleAuthorizationService.authorizeRead(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.aggregate(collectionName, filterTransformer.transform(filter), aggregationTransformer.transform({ processingStep, postFilteringStep }))
            const dataAfterAction = await executeHooksFor(Actions.AfterAggregate, data, requestContextFor(AGGREGATE, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })


    router.post('/data/insert', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const item = await executeHooksFor(Actions.BeforeInsert, payloadFor(INSERT, req.body), requestContextFor(INSERT, req.body))
            await roleAuthorizationService.authorizeWrite(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.insert(collectionName, item)

            const dataAfterAction = await executeHooksFor(Actions.AfterInsert, data, requestContextFor(INSERT, req.body))
            console.log(dataAfterAction)
            res.json(dataAfterAction)
        } catch (e) {
            console.log(e)
            next(e)
        }
    })

    router.post('/data/insert/bulk', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const items = await executeHooksFor(Actions.BeforeBulkInsert, payloadFor(BULK_INSERT, req.body), requestContextFor(BULK_INSERT, req.body))

            await roleAuthorizationService.authorizeWrite(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.bulkInsert(collectionName, items)

            const dataAfterAction = await executeHooksFor(Actions.AfterBulkInsert, data, requestContextFor(BULK_INSERT, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/get', async(req, res, next) => {
        try {
            const { collectionName } = req.body

            const itemId = await executeHooksFor(Actions.BeforeGetById, payloadFor(GET, req.body), requestContextFor(GET, req.body))
            await roleAuthorizationService.authorizeRead(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.getById(collectionName, itemId, '', 0, 1)

            const dataAfterAction = await executeHooksFor(Actions.AfterGetById, data, requestContextFor(GET, req.body))
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

            const item = await executeHooksFor(Actions.BeforeUpdate, payloadFor(UPDATE, req.body), requestContextFor(UPDATE, req.body))
            await roleAuthorizationService.authorizeWrite(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.update(collectionName, item)

            const dataAfterAction = await executeHooksFor(Actions.AfterUpdate, data, requestContextFor(UPDATE, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/update/bulk', async(req, res, next) => {
        try {
            const { collectionName } = req.body

            const items = await executeHooksFor(Actions.BeforeBulkUpdate, payloadFor(BULK_UPDATE, req.body), requestContextFor(BULK_UPDATE, req.body))
            await roleAuthorizationService.authorizeWrite(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.bulkUpdate(collectionName, items)

            const dataAfterAction = await executeHooksFor(Actions.AfterBulkUpdate, data, requestContextFor(BULK_UPDATE, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/remove', async(req, res, next) => {
        try {
            const { collectionName } = req.body

            const itemId = await executeHooksFor(Actions.BeforeRemove, payloadFor(REMOVE, req.body), requestContextFor(REMOVE, req.body))
            await roleAuthorizationService.authorizeWrite(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.delete(collectionName, itemId)

            const dataAfterAction = await executeHooksFor(Actions.AfterRemove, data, requestContextFor(REMOVE, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/remove/bulk', async(req, res, next) => {
        try {
            const { collectionName } = req.body

            const itemIds = await executeHooksFor(Actions.BeforeBulkRemove, payloadFor(BULK_REMOVE, req.body), requestContextFor(BULK_REMOVE, req.body))
            await roleAuthorizationService.authorizeWrite(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.bulkDelete(collectionName, itemIds)

            const dataAfterAction = await executeHooksFor(Actions.AfterBulkRemove, data, requestContextFor(BULK_REMOVE, req.body))
            res.json(dataAfterAction)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/count', async(req, res, next) => {
        try {
            const { collectionName } = req.body

            const filter = await executeHooksFor(Actions.BeforeCount, payloadFor(COUNT, req.body), requestContextFor(COUNT, req.body))
            await roleAuthorizationService.authorizeRead(collectionName, extractRole(req.body))
            const data = await schemaAwareDataService.count(collectionName, filterTransformer.transform(filter))

            const dataAfterAction = await executeHooksFor(Actions.AfterCount, data, requestContextFor(COUNT, req.body))
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
            const data = await schemaService.list()
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/list/headers', async(req, res, next) => {
        try {
            const data = await schemaService.listHeaders()
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/find', async(req, res, next) => {
        try {
            const { schemaIds } = req.body
            if (schemaIds && schemaIds.length > 10) {
                throw new InvalidRequest()
            }
            const data = await schemaService.find(schemaIds)
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/create', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const data = await schemaService.create(collectionName)
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/column/add', async(req, res, next) => {
        try {
            const { collectionName, column } = req.body
            const data = await schemaService.addColumn(collectionName, column)
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/schemas/column/remove', async(req, res, next) => {
        try {
            const { collectionName, columnName } = req.body
            const data = await schemaService.removeColumn(collectionName, columnName)
            res.json(data)
        } catch (e) {
            next(e)
        }
    })
    // ***********************************************

    router.use(errorMiddleware)

    return router
}
module.exports = { createRouter, initServices, enableAppInfo }
