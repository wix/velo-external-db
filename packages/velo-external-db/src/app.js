const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const compression = require('compression')
const { DataService, SchemaService } = require('velo-external-db-core')
const { init, initViaSecretManger } = require('./storage/factory')
const { errorMiddleware } = require('./web/error-middleware')
const { authMiddleware } = require('./web/auth-middleware')
const { unless } = require('./web/middleware-support')
const { createRouter } = require('./router');
const { SecretMangerClientENV, SecretMangerClientAWS } = require('secret-manger-clients');

const startup = async (type = 'aws/sql') => {
    var secretMangerClient;
    switch ( type ) {
        case 'env/sql':
            console.log(`SECRET MANGER: ${type}`);
            secretMangerClient = new SecretMangerClientAWS();
            break;
        case 'aws/sql':
            console.log(`SECRET MANGER: ${type}`);
            secretMangerClient = new SecretMangerClientAWS();   
            break;
        default:
            return Promise.reject(`Type not supplied or not recognized!`);
                
    }
    const secrets = await secretMangerClient.getSecrets();
    const initRes = init(type,secrets.host,secrets.username,secrets.password,secrets.DB);
    return {...initRes, SECRET_KEY : secrets.SECRET_KEY};
}


const app = express()
const port = process.env.PORT || 8080

startup(process.env.TYPE).then(res => {
    const {dataProvider, schemaProvider} = res;
    const dataService = new DataService(dataProvider);
    const schemaService = new SchemaService(schemaProvider);
    
    app.use(bodyParser.json())
    app.use(unless(['/', '/provision'], authMiddleware({ secretKey: res.SECRET_KEY })));
    app.use(errorMiddleware)
    app.use(compression())
    app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))

    const router = createRouter(dataService,schemaService);

    app.use('/',router);

    const server = app.listen(port/*, () => console.log(`Server listening on port ${port}!`)*/)
    module.exports = server;
}).catch(e =>{
    app.get('/', (req, res) => {
        res.send(e);
    })
    const server = app.listen(port/*, () => console.log(`Server listening on port ${port}!`)*/)
    module.exports = server;
});
