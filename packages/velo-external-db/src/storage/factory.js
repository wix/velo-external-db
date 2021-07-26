const init = (type, host, user, password, db, cloudSqlConnectionName) => {
    switch (type) {
        case 'env/sql':
        case 'aws/sql':
        case 'azr/sql':
        case 'gcp/sql':
            console.log(`INIT: ${type}`)
            const { SchemaProvider, DataProvider, FilterParser } = require('external-db-mysql')
            // const { SchemaProvider } = require('./gcp/sql/cloud_sql_schema_provider')
            // const DataProvider = require('./gcp/sql/cloud_sql_data_provider')
            // const { FilterParser } = require('./gcp/sql/sql_filter_transformer')

            const config = {
                user     : user,
                password : password,
                database : db,

                waitForConnections: true,
                namedPlaceholders: true,
                multipleStatements: true,

                // debug: true,
                // trace: true,
                connectionLimit: 10,
                queueLimit: 0,
            }
            
            if (cloudSqlConnectionName) {
                config['socketPath'] = `/cloudsql/${cloudSqlConnectionName}`
            } else {
                config['host'] = host
            }

            const mysql = require('mysql')
            const pool = mysql.createPool(config)
            //TODO: need to check if the connection succeeded.
            const filterParser = new FilterParser()
            const dataProvider = new DataProvider(pool, filterParser)
            const schemaProvider = new SchemaProvider(pool)

            return { dataProvider: dataProvider, schemaProvider: schemaProvider }
    }
}


const initViaSecretManger = async (type) => {
    switch (type) {
        case 'aws/sql':
            console.log(`SECRET MANGER: ${type}`);
            const { SecretsManagerClient, GetSecretValueCommand , DescribeSecretCommand  } = require("@aws-sdk/client-secrets-manager");
            const region = process.env.REGION || process.env.AWS_DEFAULT_REGION;
            const SecretId = process.env.SECRETNAME || 'DB_INFO';
            const SMClient = new SecretsManagerClient({ region });
            const getValueCommand = new GetSecretValueCommand({ SecretId });
        
            try {
                const response = await SMClient.send(getValueCommand);
                console.log(response);
                const { host, port, username, password,DB, SECRET_KEY } = JSON.parse(response.SecretString);
                return {init : init(type,host,username,password,DB), SECRET_KEY};
            } catch (e) {
                console.error(e);
                return Promise.reject(e.name); 
            }

    }
}

module.exports = { init, initViaSecretManger }