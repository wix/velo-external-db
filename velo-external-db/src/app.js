const express = require('express')
const path = require('path')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const compression = require('compression')
const DataService = require('./service/data')
const SchemaService = require('./service/schema')

let schemaProvider, dataProvider;

switch (process.env.TYPE) {
    case 'gcp/sql':
        console.log('INIT: gcp/sql')
        const { SchemaProvider } = require('./storage/gcp/sql/cloud_sql_schema_provider')
        const DataProvider = require('./storage/gcp/sql/cloud_sql_data_provider')
        const { FilterParser } = require('./storage/gcp/sql/sql_filter_transformer')

        const pool = mysql.createPool({
            host     : process.env.HOST,
            user     : process.env.USER,
            password : process.env.PASSWORD,
            database : process.env.DB,
            waitForConnections: true,
            namedPlaceholders: true,
            // debug: true,
            // trace: true,
            connectionLimit: 10,
            queueLimit: 0/*,
                                multipleStatements: true*/
        }).promise()
        const filterParser = new FilterParser()
        dataProvider = new DataProvider(pool, filterParser)
        schemaProvider = new SchemaProvider(pool)

        break;
}

const dataService = new DataService(dataProvider)
const schemaService = new SchemaService(schemaProvider)


const app = express()
const port = process.env.PORT || 8080

app.use(bodyParser.json())
app.use(compression())
// app.use(authMiddleware)

app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))

app.post('/data/find', async (req, res) => {
    const { collectionName, filter, sort, skip, limit } = req.body
    const data = await dataService.find(collectionName, filter, sort, skip, limit)
    res.json(data)
})

app.post('/data/insert', async (req, res) => {
    const { collectionName, item } = req.body
    const data = await dataService.insert(collectionName, item)
    res.json(data)
})

app.post('/data/get', async (req, res) => {
    const { collectionName, itemId } = req.body
    const data = await dataService.getById(collectionName, itemId)
    res.json(data)
})

app.post('/data/update', async (req, res) => {
    const { collectionName, item } = req.body
    const data = await dataService.update(collectionName, item)
    res.json(data)
})

app.post('/data/remove', async (req, res) => {
    const { collectionName, itemId } = req.body
    const data = await dataService.delete(collectionName, [itemId])
    res.json(data)
})

app.post('/data/count', async (req, res) => {
    const { collectionName, filter } = req.body
    const data = await dataService.count(collectionName, filter)
    res.json(data)
})


app.post('/schemas/list', async (req, res) => {
    const data = await schemaService.list()
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


app.get('/', (req, res) => {
    // todo: render a welcoming page with user data
    // res.send('ok')
    res.sendFile(path.join(__dirname, '..', 'index.html'));
})



const server = app.listen(port/*, () => console.log(`Server listening on port ${port}!`)*/)


module.exports = server;