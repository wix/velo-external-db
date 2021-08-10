const { Uninitialized } = require('test-commons');
const { ExternalDbConfigClient, ExternalDbConfigClientAWS, ExternalDbConfigClientAzure, ExternalDbConfigClientGCP } = require('../../lib/external_db_config_clients');

const secretMangerAwsTestEnv = require ("./aws_secretManger_resources");
const secretMangerTestEnv = require("./env_secretManger_resources");
const secretMangerGCPTestEnv = require("./gcp_secretManger_resources");

const env = {
    secretClient: Uninitialized,
    driver: Uninitialized,
    testHelper: Uninitialized,
}

const secretMangerInit = async (impl,testEnv) => {
    env.secretClient = new impl();
    env.driver = testEnv.createDriver();
    env.testHelper = testEnv.testHelper();
}


const secretMangerTestEnvInit = async () => await secretMangerInit(ExternalDbConfigClient,secretMangerTestEnv);
const secretMangerTestAWSEnvInit = async () => await secretMangerInit(ExternalDbConfigClientAWS,secretMangerAwsTestEnv);
const secretMangerTestGCPEnvInit = async () => await secretMangerInit(ExternalDbConfigClientGCP,secretMangerGCPTestEnv);
const secretMangerTestAzureEnvInit = async () => await secretMangerInit(ExternalDbConfigClientAzure,secretMangerTestEnv);


module.exports = {
    env,
    secretMangerTestEnvInit,
    secretMangerTestAWSEnvInit,
    secretMangerTestGCPEnvInit,
    secretMangerTestAzureEnvInit
}