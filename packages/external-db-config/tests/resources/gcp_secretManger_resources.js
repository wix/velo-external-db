
const { lowercaseKeys } = require("./test_commons");

const secretMangerTestEnv = require("./env_secretManger_resources");


const createDriver = () => {
    const driver = secretMangerTestEnv.createDriver();

    return driver;
}

const testHelper = () => {
    const gcpTestHelper = secretMangerTestEnv.testHelper();
    gcpTestHelper.serviceFormat = (secret) => {
        secret.CLOUD_SQL_CONNECTION_NAME = secret.HOST;
        delete secret.HOST;
        return secret;
    };
    gcpTestHelper.secretClientFormat = (secret) => {
        const formatedSecret = lowercaseKeys(secret);
        formatedSecret.cloudSqlConnectionName = formatedSecret.cloud_sql_connection_name;
        delete formatedSecret.cloud_sql_connection_name;
        formatedSecret.secretKey = formatedSecret.secret_key;
        delete formatedSecret.secret_key;
        return formatedSecret;
    };
    return gcpTestHelper;
}

module.exports = { createDriver, testHelper }