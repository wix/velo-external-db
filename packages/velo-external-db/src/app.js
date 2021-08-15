const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const compression = require('compression')
const { DataService, SchemaService, OperationService } = require('velo-external-db-core')
const { init } = require('./storage/factory')
const { authMiddleware } = require('./web/auth-middleware')
const { unless } = require('./web/middleware-support')
const createRouter = require('./router')


const load = async () => {
    const secretKey = process.env.SECRET_KEY
    const { dataProvider, schemaProvider, cleanup, databaseOperations } = await init()
    const operationService = new OperationService(databaseOperations)
    const dataService = new DataService(dataProvider)
    const schemaService = new SchemaService(schemaProvider)
    return { dataService, schemaService, operationService, secretKey, cleanup }
}


const main = async () => {
    const app = express()
    const port = process.env.PORT || 8080
    const { dataService, schemaService, operationService, secretKey, cleanup } = await load();

    app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))
    app.use(bodyParser.json())
    app.use(unless(['/', '/provision'], authMiddleware({ secretKey: secretKey })));
    app.use(compression())
    app.set('view engine', 'ejs');

    const router = createRouter(dataService, schemaService, operationService)
    app.use('/', router)
    const server = app.listen(port)
    return { server, cleanup, load }
}

if (process.env.NODE_ENV !== 'test') {
    main();
}

module.exports = main;
