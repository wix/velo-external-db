const express = require('express')
const path = require('path')
const { config } = require('../roles-config.json')
const compression = require('compression')
const { DataService, SchemaService, OperationService } = require('velo-external-db-core')
const { init } = require('./storage/factory')
const { authMiddleware } = require('./web/auth-middleware')
const { authRoleMiddleware } = require('./web/auth-role-middleware')
const { unless, includes } = require('./web/middleware-support')
const { createRouter, initServices } = require('./router')
const { create, readCommonConfig } = require('external-db-config')

let started = false
let server, _cleanup

const load = async () => {
    const { vendor, type: adapterType } = readCommonConfig()
    const configReader = create()
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
    app.use(unless(['/', '/provision', '/favicon.ico'], authMiddleware({ secretKey: secretKey })));
    config.forEach( ( { pathPrefix, roles }) => app.use(includes([pathPrefix], authRoleMiddleware({ roles }))))
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
