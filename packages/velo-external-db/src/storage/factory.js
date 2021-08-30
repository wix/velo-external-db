const append = (res, secretKey) => Object.assign({}, res, {secretKey: secretKey})

const init = async(type, vendor, config) => {
    console.log(`INIT: ${vendor + '/' + type}`)
    switch ( type ) {
        case 'postgres': {
            const { init } = require('external-db-postgres')
            const { host, user, password, db, cloudSqlConnectionName, secretKey } = await config.readConfig()

            return append(init([host,user,password,db,cloudSqlConnectionName]), secretKey)
        }
        case 'spanner': {
            const { init } = require('external-db-spanner')

            const { projectId, instanceId, databaseId, secretKey } = await config.readConfig()
            return append(init([projectId, instanceId, databaseId]), secretKey)
        }
        default:
            case 'mysql':{
                console.log(`INIT: ${vendor + '/' + type}`)
                const { init } = require('external-db-mysql')
                const { host, user, password, db, cloudSqlConnectionName, secretKey } = await config.readConfig()
                return append(init([host,user,password,db,cloudSqlConnectionName]), secretKey)
            }

    }
}

module.exports = { init }