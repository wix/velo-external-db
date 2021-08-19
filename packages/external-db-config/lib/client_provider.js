const { ExternalDbConfigClient, ExternalDbConfigClientAWS, ExternalDbConfigClientGCP } = require('./external_db_config_clients')

const createExternalDbConfigClient = (vendor) => {
    // create impl from vendor
    // read config
    switch (vendor) {
        case 'azr':
            return new ExternalDbConfigClient();
        case 'aws':
            return new ExternalDbConfigClientAWS();
        case 'gcp':
            return new ExternalDbConfigClientGCP();
        default:
            throw new Error(`Type variable not supplied or not recognized [${vendor}].`);
    }
}

module.exports = { createExternalDbConfigClient };

