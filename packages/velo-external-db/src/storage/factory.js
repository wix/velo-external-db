const append = (res, secretKey) => Object.assign({}, res, {secretKey: secretKey})

const init = async(type, vendor, config) => {
    const { host, user, password, db, cloudSqlConnectionName, secretKey } = await config.readConfig()
    console.log(`INIT: ${vendor + '/' + type}`)
    switch ( type ) {
        case 'postgres': {
            const { init } = require('external-db-postgres')

            return append(init([host,user,password,db,cloudSqlConnectionName]), secretKey)
        }
        case 'spanner': {
            const { init } = require('external-db-spanner')

            return append(init([host,user,password,db,cloudSqlConnectionName]), secretKey)
        }
        default:
            case 'mysql':{
                console.log(`INIT: ${vendor + '/' + type}`)
                const { init } = require('external-db-mysql')
                return append(init([host,user,password,db,cloudSqlConnectionName]), secretKey)
            }

    }
}

module.exports = { init }