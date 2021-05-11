const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const compression = require('compression')
const DataService = require('./service/data')
const SchemaService = require('./service/schema')
const { init } = require('./storage/factory')
const { errorMiddleware } = require('./web/error-middleware')

const {dataProvider, schemaProvider} = init(process.env.TYPE, process.env.HOST, process.env.USER, process.env.PASSWORD, process.env.DB, process.env.CLOUD_SQL_CONNECTION_NAME)
const dataService = new DataService(dataProvider)
const schemaService = new SchemaService(schemaProvider)


const app = express()
const port = process.env.PORT || 8080

app.use(bodyParser.json())
app.use(errorMiddleware)
app.use(compression())
// app.use(authMiddleware)
// todo: add auth middleware
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))

// *************** INFO **********************
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
})

app.post('/provision', (req, res) => {
    res.json({});
})


// *************** Data API **********************
app.post('/data/find', async (req, res, next) => {
    try {
        const { collectionName, filter, sort, skip, limit } = req.body
        const data = await dataService.find(collectionName, filter, sort, skip, limit)
        res.json(data)
    } catch (e) {
        next(e)
    }
})

app.post('/data/insert', async (req, res, next) => {
    try {
        const { collectionName, item } = req.body
        const data = await dataService.insert(collectionName, item)
        res.json(data)
    } catch (e) {
        next(e)
    }
})

app.post('/data/get', async (req, res, next) => {
    try {
        const { collectionName, itemId } = req.body
        const data = await dataService.getById(collectionName, itemId)
        res.json(data)
    } catch (e) {
        next(e)
    }
})

app.post('/data/update', async (req, res, next) => {
    try {
        const { collectionName, item } = req.body
        const data = await dataService.update(collectionName, item)
        res.json(data)
    } catch (e) {
        next(e)
    }
})

app.post('/data/remove', async (req, res, next) => {
    try {
        const { collectionName, itemId } = req.body
        const data = await dataService.delete(collectionName, [itemId])
        res.json(data)
    } catch (e) {
        next(e)
    }
})

app.post('/data/count', async (req, res, next) => {
    try {
        const { collectionName, filter } = req.body
        const data = await dataService.count(collectionName, filter)
        res.json(data)
    } catch (e) {
        next(e)
    }
})
// ***********************************************


// *************** Schema API **********************
app.post('/schemas/list', async (req, res) => {
    const data = await schemaService.list()
    res.json(data)
})

app.post('/schemas/find', async (req, res) => {
    const { schemaIds } = req.body
    const data = await schemaService.find(schemaIds)
    res.json(data)
})

app.post('/schemas/create', async (req, res) => {
    const { collectionName } = req.body
    const data = await schemaService.create(collectionName)
    res.json(data)
})

app.post('/schemas/column/add', async (req, res) => {
    const { collectionName, column } = req.body
    const data = await schemaService.addColumn(collectionName, column)
    res.json(data)
})

app.post('/schemas/column/remove', async (req, res) => {
    const { collectionName, columnName } = req.body
    const data = await schemaService.removeColumn(collectionName, columnName)
    res.json(data)
})
// ***********************************************

const server = app.listen(port/*, () => console.log(`Server listening on port ${port}!`)*/)
module.exports = server;
