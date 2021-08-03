const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const { DataService, SchemaService } = require('velo-external-db-core')
const { init } = require('./storage/factory')
const { errorMiddleware } = require('./web/error-middleware')
const { authMiddleware } = require('./web/auth-middleware')
const { unless } = require('./web/middleware-support')
const createRouter = require('./router')
const path = require('path')

const load = async () => {
    const { type, host, user, password, db, cloudSqlConnectionName } = { type: process.env.TYPE, host: process.env.HOST, user: process.env.USER, password: process.env.PASSWORD, db: process.env.DB, cloudSqlConnectionName: process.env.CLOUD_SQL_CONNECTION_NAME }

    const { dataProvider, schemaProvider, cleanup: cleanupDbFunc, databaseOperations } = init(type, host, user, password, db, cloudSqlConnectionName)
    await databaseOperations.checkIfConnectionSucceeded()
    const dataService = new DataService(dataProvider)
    const schemaService = new SchemaService(schemaProvider)
    const cleanup = cleanupDbFunc

    return { dataService, schemaService, cleanup }
}

load().then(async (res) => {
    const app = express()
    const port = process.env.PORT || 8080

    app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))
    app.use(bodyParser.json())
    app.use(unless(['/', '/provision'], authMiddleware({ secretKey: process.env.SECRET_KEY })));
    app.use(errorMiddleware)
    app.use(compression())

    const router = await createRouter(res.dataService, res.schemaService)
    app.use('/', router)

    const server = app.listen(port)

    module.exports = { server, cleanup: res.cleanup, load };
}).catch(err => {
    const app = express()
    const port = process.env.PORT || 8080
    app.use('/', (req, res) => {
        res.send(err.message)
    })

    const server = app.listen(port)

    module.exports = { server, cleanup: undefined, load };
})

