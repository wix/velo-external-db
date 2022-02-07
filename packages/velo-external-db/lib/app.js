const express = require('express')
const path = require('path')
const { config } = require('../roles-config.json')
const { collectionLevelConfig } = require ('../collection-level-roles-config.json')
const compression = require('compression')
const { DataService, SchemaService, OperationService, CacheableSchemaInformation, FilterTransformer, AggregationTransformer, QueryValidator, SchemaAwareDataService, ItemTransformer } = require('velo-external-db-core')
const { RoleAuthorizationService, createAuthProviderFor } = require ('external-db-authorization')
const { init } = require('./storage/factory')
const { authMiddleware, secretKeyAuthMiddleware, initAuthMiddleware } = require('./web/auth-middleware')
const { authRoleMiddleware } = require('./web/auth-role-middleware')
const { unless, includes } = require('./web/middleware-support')
const { createRouter, initServices } = require('./router')
const { createAuthRouter, initAuthService } = require('./auth_router')
const { create, readCommonConfig } = require('external-db-config')
const session = require('express-session')
const passport = require('passport')

let started = false
let server, _cleanup

const load = async() => {
    const { vendor, type: adapterType } = readCommonConfig()
    const configReader = create()
    const { dataProvider, schemaProvider, cleanup, databaseOperations, secretKey } = await init(adapterType, vendor, configReader)
    const operationService = new OperationService(databaseOperations)
    const schemaInformation = new CacheableSchemaInformation(schemaProvider)
    const filterTransformer = new FilterTransformer()
    const aggregationTransformer = new AggregationTransformer(filterTransformer)
    const queryValidator = new QueryValidator()
    const dataService = new DataService(dataProvider)
    const itemTransformer = new ItemTransformer()
    const schemaAwareDataService = new SchemaAwareDataService(dataService, queryValidator, schemaInformation, itemTransformer)
    const schemaService = new SchemaService(schemaProvider, schemaInformation)
    const { authProvider, isValidAuthProvider } = await createAuthProviderFor(vendor, configReader)
    const roleAuthorizationService = new RoleAuthorizationService(collectionLevelConfig)
    
    initServices(schemaAwareDataService, schemaService, operationService, configReader, { vendor, type: adapterType }, filterTransformer, aggregationTransformer, roleAuthorizationService)
    initAuthService(authProvider)
    initAuthMiddleware(isValidAuthProvider, configReader)
    
    _cleanup = async() => {
        await cleanup()
        schemaInformation.cleanup()
    }
    return { secretKey }
}


load().then(({ secretKey }) => {
    const app = express()

    app.use('/assets', express.static(path.join(__dirname, '..', 'assets')))
    app.use(express.json())
    app.use(require('cookie-parser')())
    app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: false }))
    app.use(passport.initialize())
    app.use(passport.session())

    app.use(unless(['/', '/provision', '/favicon.ico', '/auth/login', '/auth/callback', '/auth/logout'], secretKeyAuthMiddleware({ secretKey: secretKey })))
    config.forEach( ( { pathPrefix, roles }) => app.use(includes([pathPrefix], authRoleMiddleware({ roles }))))
    app.all('/', authMiddleware)

    app.use(compression())
    app.set('view engine', 'ejs')

    const router = createRouter()
    const authRouter = createAuthRouter()

    app.use('/', authRouter)
    app.use('/', router)

    const port = process.env.PORT || 8080
    server = app.listen(port)

    started = true
})

const internals = () => ({ server: server, cleanup: _cleanup, started: started, reload: load })


module.exports = { internals }
