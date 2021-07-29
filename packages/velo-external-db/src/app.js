const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const compression = require('compression')
const { DataService, SchemaService } = require('velo-external-db-core')
const { init } = require('./storage/factory')
const { errorMiddleware } = require('./web/error-middleware')
const { authMiddleware } = require('./web/auth-middleware')
const { unless } = require('./web/middleware-support')
const { createRouter } = require('./router');
const { createSecretClient } = require('secret-manger-clients');

const startup = async ( type ) => {
    const secretMangerClient = createSecretClient(type);
    const secrets = await secretMangerClient.getSecrets();
    const initRes = await init(type,secrets.host,secrets.username,secrets.password,secrets.db,secrets.cloudSqlConnectionName);
    console.log('Initialization completed successfully!');
    return {...initRes, secretKey : secrets.secretKey};
}

const app = express()
const port = process.env.PORT || 8080

startup(process.env.TYPE).then(res => {
    const {dataProvider, schemaProvider} = res;
    const dataService = new DataService(dataProvider);
    const schemaService = new SchemaService(schemaProvider);
    
    app.use(bodyParser.json())
    app.use(unless(['/', '/provision'], authMiddleware({ secretKey: res.secretKey })));
    app.use(errorMiddleware)
    app.use(compression())
    app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))

    const router = createRouter(dataService,schemaService);

    app.use('/',router);

    const server = app.listen(port/*, () => console.log(`Server listening on port ${port}!`)*/)
    module.exports = server;
}).catch(err => {
    console.log(err);
    app.get('/', (req, res) => {
        res.send(err.message);
    })
    const server = app.listen(port/*, () => console.log(`Server listening on port ${port}!`)*/)
    module.exports = server;
});

