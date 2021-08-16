const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const compression = require('compression')
const { DataService, SchemaService, OperationService } = require('velo-external-db-core')
const { init } = require('./storage/factory')
const { authMiddleware } = require('./web/auth-middleware')
const { unless } = require('./web/middleware-support')
const { createRouter, initServices } = require('./router')

let started = false
let server, _cleanup

const load = async () => {
    const secretKey = process.env.SECRET_KEY
    const { dataProvider, schemaProvider, cleanup, databaseOperations } = await init()
    const operationService = new OperationService(databaseOperations)
    const dataService = new DataService(dataProvider)
    const schemaService = new SchemaService(schemaProvider)
    initServices(dataService, schemaService, operationService)
    _cleanup = cleanup
    return { secretKey }
}


load().then(({ secretKey}) => {
    const app = express()

    app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))
    app.use(bodyParser.json())
    app.use(unless(['/', '/provision'], authMiddleware({ secretKey: secretKey })));
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
