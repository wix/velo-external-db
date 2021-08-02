'use strict';

const {SecretMangerClientENV,SecretMangerClientAWS, SecretMangerClientAzure, SecretMangerClientGCP } = require('./secretMangerClients')

const createSecretClient = (type) => { 
    switch ( type ) {
        case 'env/sql':
            console.log(`SECRET MANGER: ${type}`);
            return new SecretMangerClientENV();
        case 'aws/sql':
            console.log(`SECRET MANGER: ${type}`);
            return  new SecretMangerClientAWS();   
        case 'azr/sql':
            console.log(`SECRET MANGER: ${type}`);
            return new SecretMangerClientAzure(); 
        case 'gcp/sql':
            console.log(`SECRET MANGER: ${type}`);
            return new SecretMangerClientGCP(); 
        default:
            throw new Error (`Type variable not supplied or not recognized.`);
    }
}

module.exports = { createSecretClient };

