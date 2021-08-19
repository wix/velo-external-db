const { createExternalDbConfigClient } = require("external-db-config")

const append = (res, secretKey) => Object.assign({}, res, {secretKey: secretKey})

const init = async(type, vendor) => {
    const externalDbConfigClient = createExternalDbConfigClient(vendor);
    const { host, user, password, db, cloudSqlConnectionName, secretKey } = await externalDbConfigClient.readConfig();
    switch ( type ) {
        case 'mysql':{
            console.log(`INIT: ${vendor + '/' + type}`)
            const { init } = require('external-db-mysql')
            return append(init([host,user,password,db,cloudSqlConnectionName]), secretKey)
        }
        case 'postgres': {
            console.log(`INIT: ${vendor + '/' + type}`)
            const { init } = require('external-db-postgres')

            return append(init([host,user,password,db,cloudSqlConnectionName]), secretKey)
        }

    }
}

module.exports = { init }