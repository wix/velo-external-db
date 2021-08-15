const { ExternalDbConfigClient, ExternalDbConfigClientAWS, ExternalDbConfigClientGCP } = require('./external_db_config_clients')

const createExternalDbConfigClient = (type) => {
    switch (type) {
        case 'sql/mysql':
        case 'sql/postgres':
            console.log(`EXTERNAL DB CONFIG: ${type}`);
            return new ExternalDbConfigClient();
        case 'aws/mysql':
        case 'aws/postgres':
            console.log(`EXTERNAL DB CONFIG: ${type}`);
            return new ExternalDbConfigClientAWS();
        case 'azr/mysql':
        case 'azr/postgres':
            console.log(`EXTERNAL DB CONFIG: ${type}`);
            return new ExternalDbConfigClient();
        case 'gcp/mysql':
        case 'gcp/postgres':
            console.log(`EXTERNAL DB CONFIG: ${type}`);
            return new ExternalDbConfigClientGCP();
        default:
            throw new Error(`Type variable not supplied or not recognized.`);
    }
}

module.exports = { createExternalDbConfigClient };

