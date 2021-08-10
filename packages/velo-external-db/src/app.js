const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const compression = require('compression')
const { DataService, SchemaService } = require('velo-external-db-core')
const { init } = require('./storage/factory')
const { errorMiddleware } = require('./web/error-middleware')
const { authMiddleware } = require('./web/auth-middleware')
const { unless } = require('./web/middleware-support')
const createRouter = require('./router')




process.env.TYPE="gcp/sql"
process.env.HOST="velo-external-db-mysql22.mysql.database.azure.com"
process.env.USER="demo_admin@velo-external-db-mysql22"
process.env.DB="guest"
process.env.PASSWORD="veloPassword1"
process.env.SECRET_KEY="hello"

const load = async () => {
    const { type, host, user, password, db, cloudSqlConnectionName } = { type: process.env.TYPE, host: process.env.HOST, user: process.env.USER, password: process.env.PASSWORD, db: process.env.DB, cloudSqlConnectionName: process.env.CLOUD_SQL_CONNECTION_NAME }
    const { dataProvider, schemaProvider, cleanup, databaseOperations } = init(type, host, user, password, db, cloudSqlConnectionName)
    await databaseOperations.checkIfConnectionSucceeded()
    const dataService = new DataService(dataProvider)
    const schemaService = new SchemaService(schemaProvider)
    return { dataService, schemaService, databaseOperations, cleanup }
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
        const  { dataService, schemaService, databaseOperations, cleanup } = await load();
        const router = createRouter(dataService, schemaService, databaseOperations)
        app.use('/', router)
        const server =  app.listen(port)
        return {server, cleanup,load }
    } catch (err) {
        app.get('/', (req, res) => {
            res.render('error', { STATUS: err.message, host: process.env.HOST, database: process.env.DB });
        })

        app.use('/', (req, res) => {
            res.send(err.message)
        })
        app.listen(port)
    }
}

if (process.env.NODE_ENV !== 'test'){
    main();
}

module.exports = main;
