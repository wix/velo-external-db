const express = require('express')
const { errorMiddleware } = require('./web/error-middleware')
const { appInfoFor } = require ('./health/app_info')
const { InvalidRequest, ItemNotFound } = require('velo-external-db-commons').errors

let dataService, schemaService, operationService, externalDbConfigClient, schemaAwareDataService, cfg

const initServices = (_dataService, _schemaService, _operationService, _externalDbConfigClient, _schemaAwareDataService, _cfg) => {
    dataService = _dataService
    schemaService = _schemaService
    operationService = _operationService
    externalDbConfigClient = _externalDbConfigClient
    cfg = _cfg
    schemaAwareDataService = _schemaAwareDataService
}

const createRouter = () => {
    const router = express.Router()

    // *************** INFO **********************
    router.get('/', async(req, res) => {
        const appInfo = await appInfoFor(operationService, externalDbConfigClient)
        res.render('index', appInfo)
    })

    router.post('/provision', (req, res) => {
        res.json({ ...cfg, protocolVersion: 2 })
    })

    // *************** Data API **********************
    router.post('/data/find', async(req, res, next) => {
        try {
            const { collectionName, filter, sort, skip, limit } = req.body
            const domainFilter = await schemaAwareDataService.transformAndValidateFilter(collectionName, filter)
            const data = await dataService.find(collectionName, domainFilter, sort, skip, limit)
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/aggregate', async(req, res, next) => {
        try {
            const { collectionName, filter, processingStep, postFilteringStep } = req.body
            const domainFilter = await schemaAwareDataService.transformAndValidateFilter(collectionName, filter)
            const domainAggregation = await schemaAwareDataService.transformAndValidateAggregation(collectionName, { processingStep, postFilteringStep })
            const data = await dataService.aggregate(collectionName, domainFilter, domainAggregation)
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/insert', async(req, res, next) => {
        try {
            const { collectionName, item } = req.body
            const prepared = await schemaAwareDataService.prepareItemsForInsert(collectionName, [item])  
            const data = await dataService.insert(collectionName, prepared[0])
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/insert/bulk', async(req, res, next) => {
        try {
            const { collectionName, items } = req.body
            const prepared = await schemaAwareDataService.prepareItemsForInsert(collectionName, items) 
            const data = await dataService.bulkInsert(collectionName, prepared)
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/get', async(req, res, next) => {
        try {
            const { collectionName, itemId } = req.body
            const data = await dataService.getById(collectionName, itemId)
            if (!data.item) {
                throw new ItemNotFound('Item not found')
            }
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/update', async(req, res, next) => {
        try {
            const { collectionName, item } = req.body
            const prepared = await schemaAwareDataService.prepareItemsForUpdate(collectionName, [item])
            const data = await dataService.update(collectionName, prepared[0])
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/update/bulk', async(req, res, next) => {
        try {
            const { collectionName, items } = req.body
            const prepared = await schemaAwareDataService.prepareItemsForUpdate(collectionName, items)
            const data = await dataService.bulkUpdate(collectionName, prepared)
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/remove', async(req, res, next) => {
        try {
            const { collectionName, itemId } = req.body
            const data = await dataService.delete(collectionName, itemId)
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/remove/bulk', async(req, res, next) => {
        try {
            const { collectionName, itemIds } = req.body
            const data = await dataService.bulkDelete(collectionName, itemIds)
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/count', async(req, res, next) => {
        try {
            const { collectionName, filter } = req.body
            const domainFilter = await schemaAwareDataService.transformAndValidateFilter(collectionName, filter)
            const data = await dataService.count(collectionName, domainFilter)
            res.json(data)
        } catch (e) {
            next(e)
        }
    })

    router.post('/data/truncate', async(req, res, next) => {
        try {
            const { collectionName } = req.body
            const data = await dataService.truncate(collectionName)
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
module.exports = { createRouter, initServices }
