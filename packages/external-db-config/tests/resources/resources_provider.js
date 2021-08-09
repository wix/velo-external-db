const { Uninitialized } = require('test-commons');
const { SecretMangerClient, SecretMangerClientAWS, SecretMangerClientGCP,SecretMangerClientAzure } = require('../../lib/secretMangerClients');

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


const secretMangerTestEnvInit = async () => await secretMangerInit(SecretMangerClient,secretMangerTestEnv);
const secretMangerTestAWSEnvInit = async () => await secretMangerInit(SecretMangerClientAWS,secretMangerAwsTestEnv);
const secretMangerTestGCPEnvInit = async () => await secretMangerInit(SecretMangerClientGCP,secretMangerGCPTestEnv);
const secretMangerTestAzureEnvInit = async () => await secretMangerInit(SecretMangerClientAzure,secretMangerTestEnv);


module.exports = {
    env,
    secretMangerTestEnvInit,
    secretMangerTestAWSEnvInit,
    secretMangerTestGCPEnvInit,
    secretMangerTestAzureEnvInit
}