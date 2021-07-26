'use strict';

const {SecretMangerClientENV,SecretMangerClientAWS } = require('./secret_mager_aws')
const {SecretMangerClientAzure} = require('./secret_manger_azure')
module.exports = { SecretMangerClientENV,SecretMangerClientAWS, SecretMangerClientAzure};

