const { createExternalDbConfigClient } = require("external-db-config")

const append = (res, secretKey) => Object.assign({}, res, {secretKey: secretKey})

const init = async(type, vendor) => {
    const externalDbConfigClient = createExternalDbConfigClient(vendor);
    const { host, user, password, db, cloudSqlConnectionName, secretKey } = await externalDbConfigClient.readConfig();
    switch (type) {
        case 'aws/mysql':
        case 'azr/mysql':
        case 'gcp/mysql':    
        case 'sql/mysql':{
            console.log(`INIT: ${type}`)
            const { init } = require('external-db-mysql')
            return append(init([host,user,password,db,cloudSqlConnectionName]), secretKey)
        }
        case 'aws/postgres':
        case 'azr/postgres':
        case 'gcp/postgres':     
        case 'sql/postgres': {
            console.log(`INIT: ${type}`)
            const { init } = require('external-db-postgres')

            return append(init([host,user,password,db,cloudSqlConnectionName]), secretKey)
        }

    }
}

module.exports = { init }