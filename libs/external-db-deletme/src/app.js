const express = require('express')
const { ExternalDbRouter } = require('@wix-velo/velo-external-db-core')
const { mySqlFactory } = require('@wix-velo/external-db-mysql')

const main = async() => {
    const { connector: engineConnector, cleanup } = await mySqlFactory({
        user: 'test-user',
        host: 'localhost',
        password: 'password',
        db: 'test-db'
    })

    const externalDbRouter = new ExternalDbRouter({
        connector: engineConnector,
        config: {
            secretKey: 'secretKey'
        },
        hooks: {
            schemaHooks: {
                beforeCreate: (payload, _requestContext, _serviceContext) => {
                    return { ...payload, collectionName: payload.collectionName + '-hook' }
                }
            }
        }
    })

    const app = express()
    app.use(externalDbRouter.router)

    const server = app.listen(8080, () => console.log('Listening on port 8080'))
    
    return { server, externalDbRouter, cleanup }
}

module.exports = { main }