const { createExternalDbConfigClient } = require("external-db-config")

const append = (res, secretKey) => Object.assign({}, res, {secretKey: secretKey})

const init = async(type, vendor) => {
    const externalDbConfigClient = createExternalDbConfigClient(vendor);
    const { host, user, password, db, cloudSqlConnectionName, secretKey } = await externalDbConfigClient.readConfig();
    console.log(`INIT: ${vendor + '/' + type}`)
    switch ( type ) {
        case 'mysql':{
            const { init } = require('external-db-mysql')
            return append(init([host,user,password,db,cloudSqlConnectionName]), secretKey)
        }
        case 'postgres': {
            const { init } = require('external-db-postgres')

            return append(init([host,user,password,db,cloudSqlConnectionName]), secretKey)
        }
        case 'spanner': {
            const { init } = require('external-db-spanner')

            return append(init([host,user,password,db,cloudSqlConnectionName]), secretKey)
        }

    }
}

module.exports = { init }