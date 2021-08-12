const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const compression = require('compression')
const { DataService, SchemaService, OperationService } = require('velo-external-db-core')
const { init } = require('./storage/factory')
const { errorMiddleware } = require('./web/error-middleware')
const { authMiddleware } = require('./web/auth-middleware')
const { unless } = require('./web/middleware-support')
const createRouter = require('./router')
const {createExternalDbConfigClient} = require("external-db-config")




const load = async () => {
    const type = process.env.TYPE;
    const secretId = process.env.SECRET_ID;
    const externalDbConfigClient = createExternalDbConfigClient(type,secretId);
    const { host, user, password, db, cloudSqlConnectionName } = await externalDbConfigClient.readConfig();
    const { dataProvider, schemaProvider, cleanup, databaseOperations } = init(type, host, user, password, db, cloudSqlConnectionName)
    const operationService = new OperationService(databaseOperations)
    const dataService = new DataService(dataProvider)
    const schemaService = new SchemaService(schemaProvider)
    await operationService.validateConnection()
    return { dataService, schemaService, operationService, cleanup }
}


const main = async () => {
    const app = express()
    const port = process.env.PORT || 8080

    app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))
    app.use(bodyParser.json())
    app.use(unless(['/', '/provision'], authMiddleware({ secretKey: process.env.SECRET_KEY })));
    app.use(errorMiddleware)
    app.use(compression())
    app.set('view engine', 'ejs');

    try {
        const { dataService, schemaService, operationService, cleanup } = await load();
        const router = createRouter(dataService, schemaService, operationService)
        app.use('/', router)
        const server = app.listen(port)
        return { server, cleanup, load }
    } catch (err) {
        app.get('/', (req, res) => {
            res.render('error', { error: err.message });
        })

        app.use('/', (req, res) => {
            res.send(err.message)
        })
        app.listen(port)
    }
}

if (process.env.NODE_ENV !== 'test') {
    main();
}

module.exports = main;
