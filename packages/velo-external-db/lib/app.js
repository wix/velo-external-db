const express = require('express')
const { create } = require('external-db-config')
const { MySqlConnector } = require('external-db-mysql')
const { ConnectorRouter } = require ('velo-external-db-core')


const initMySqlConnector = async() => {
    const configReader = create()
    const mySqlConfig = await configReader.readConfig()
    
    
    const { host, user, password, db, authorization } = mySqlConfig

    const mySqlConnector = new MySqlConnector({ host, user, password, db })
    await mySqlConnector.initProviders()
    const connectorRouter = new ConnectorRouter(mySqlConnector, { authorization: { roleConfig: { collectionLevelConfig: authorization } }, secretKey: process.env.SECRET_KEY })

    const app = express()
    app.set('view engine', 'ejs')

    app.use(connectorRouter.router)
    
    app.listen(8080, () => console.log('MySql connector listening on port 8080'))
}


initMySqlConnector()


module.exports = {  }
