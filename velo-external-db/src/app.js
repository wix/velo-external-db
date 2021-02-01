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

// app.post('/data/find', wrapError(items.findItems))
// app.post('/data/find', async (req, res) => {
//     const { collectionName, filter, sort, skip, limit } = req.body
//     const resp = await data.find(collectionName, filter, sort, skip, limit)
//
//     res.json(resp)
//
//
//     // wrapError(items.findItems)
// })
app.get('/', (req, res) => {
    // todo: render a welcoming page with user data
    // res.send('ok')
    res.sendFile(path.join(__dirname, '..', 'index.html'));
})

// app.post('/data/insert', wrapError(items.insertItem))
// app.post('/data/update', wrapError(items.updateItem))
// app.post('/data/remove', wrapError(items.removeItem))
// app.post('/data/count', wrapError(items.countItems))
// app.post('/provision', wrapError(provision.provision))

// app.use(errorMiddleware)

/*
exports.findItems = async (req, res) => {
  const findResult = await Storage.find(req.body)

  res.json(findResult)
}

exports.getItem = async (req, res) => {
  const getResult = await Storage.get(req.body)

  res.json(getResult)
}

exports.insertItem = async (req, res) => {
  const insertResult = await Storage.insert(req.body)

  res.json(insertResult)
}

exports.updateItem = async (req, res) => {
  const updateResult = await Storage.update(req.body)

  res.json(updateResult)
}

exports.removeItem = async (req, res) => {
  const removeResult = await Storage.remove(req.body)

  res.json(removeResult)
}

exports.countItems = async (req, res) => {
  const countResult = await Storage.count(req.body)

  res.json(countResult)
}

 */

const server = app.listen(port/*, () => console.log(`Server listening on port ${port}!`)*/)


module.exports = server;