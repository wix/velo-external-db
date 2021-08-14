const {createExternalDbConfigClient} = require("external-db-config")

const init = async() => {
    const type = process.env.TYPE;
    const secretId = process.env.SECRET_ID;
    const externalDbConfigClient = createExternalDbConfigClient(type,secretId);
    const { host, user, password, db, cloudSqlConnectionName } = await externalDbConfigClient.readConfig();
    switch (type) {
        case 'aws/mysql':
        case 'azr/mysql':
        case 'gcp/mysql':    
        case 'sql/mysql':{
            console.log(`INIT: ${type}`)
            const { init } = require('external-db-mysql')
            return init([host,user,password,db,cloudSqlConnectionName])
        }
        case 'aws/postgres':
        case 'azr/postgres':
        case 'gcp/postgres':     
        case 'sql/postgres': {
            console.log(`INIT: ${type}`)
            const { init } = require('external-db-postgres')

            return init([host,user,password,db,cloudSqlConnectionName])
        }

    }
}

module.exports = { init }