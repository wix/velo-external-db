const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const compression = require('compression')
const DataService = require('./service/data')
// const DataProvider = require('./storage/gcp/sql/cloud_sql_data_provider.js')
const DataProvider = require('./storage/storage')
//const SeoWixCodeProcessor = require('./processors/seo-wix-code-processor')
// const items = require('./controller/items')
// const schemas = require('./controller/schemas')
// const provision = require('./controller/provision')
// const { wrapError, errorMiddleware } = require('./utils/error-middleware')
// const authMiddleware = require('./utils/auth-middleware')

const dataProvider = new DataProvider()
const dataService = new DataService(dataProvider)

const app = express()
const port = process.env.PORT || 8080

app.use(bodyParser.json())
app.use(compression())
// app.use(authMiddleware)

app.use(express.static('assets'))

//const { collectionName, filter, sort, skip, limit } = payload // find

app.post('/data/find', async (req, res) => {
    const { collectionName, filter, sort, skip, limit } = req.body
    const data = await dataService.find(collectionName, filter, sort, skip, limit)
    res.json(data)
})
// app.post('/schemas/list', wrapError(schemas.listSchemas))

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