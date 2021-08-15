const { ExternalDbConfigClient, ExternalDbConfigClientAWS, ExternalDbConfigClientGCP } = require('./external_db_config_clients')

const createExternalDbConfigClient = (type) => {
    switch (type) {
        case 'sql/mysql':
        case 'sql/postgres':
            return new ExternalDbConfigClient();
        case 'aws/mysql':
        case 'aws/postgres':
            return new ExternalDbConfigClientAWS();
        case 'azr/mysql':
        case 'azr/postgres':
            return new ExternalDbConfigClient();
        case 'gcp/mysql':
        case 'gcp/postgres':
            return new ExternalDbConfigClientGCP();
        default:
            throw new Error(`Type variable not supplied or not recognized.`);
    }
}

module.exports = { createExternalDbConfigClient };

