const express = require('express')
const path = require('path')
const compression = require('compression')
const { DataService, SchemaService, OperationService } = require('velo-external-db-core')
const { init } = require('./storage/factory')
const { authMiddleware } = require('./web/auth-middleware')
const { unless } = require('./web/middleware-support')
const { createRouter, initServices } = require('./router')
const config = require('external-db-config')


let started = false
let server, _cleanup
const vendor = process.env.CLOUD_VENDOR


const load = async () => {
    const adapterType = process.env.TYPE
    const configReader = config.create(vendor)
    const { dataProvider, schemaProvider, cleanup, databaseOperations, secretKey } = await init(adapterType, vendor, configReader)
    const operationService = new OperationService(databaseOperations)
    const dataService = new DataService(dataProvider)
    const schemaService = new SchemaService(schemaProvider)
    initServices(dataService, schemaService, operationService, configReader)
    _cleanup = cleanup
    return { secretKey }
}


load().then(({ secretKey}) => {
    const app = express()

    app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))
    app.use(express.json())
    app.use(unless(['/', '/provision','/favicon.ico'], authMiddleware({ secretKey: secretKey })));
    app.use(compression())
    app.set('view engine', 'ejs');

    const router = createRouter()

    app.use('/', router)

    const port = process.env.PORT || 8080
    server = app.listen(port)

    started = true
})

const internals = () => ({ server: server, cleanup: _cleanup, started: started, reload: load })


module.exports = { internals };
