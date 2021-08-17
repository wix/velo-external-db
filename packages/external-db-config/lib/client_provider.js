const { ExternalDbConfigClient, ExternalDbConfigClientAWS, ExternalDbConfigClientGCP } = require('./external_db_config_clients')

const createExternalDbConfigClient = (vendor) => {
    // create impl from vendor
    // read config
    switch (vendor) {
        case 'sql/mysql':
        case 'sql/postgres':
        case 'azr/mysql':
        case 'azr/postgres':
            return new ExternalDbConfigClient();
        case 'aws/mysql':
        case 'aws/postgres':
            return new ExternalDbConfigClientAWS();
        case 'gcp/mysql':
        case 'gcp/postgres':
            return new ExternalDbConfigClientGCP();
        default:
            throw new Error(`Type variable not supplied or not recognized [${vendor}].`);
    }
}

module.exports = { createExternalDbConfigClient };

