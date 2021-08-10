
const { lowercaseKeys,deleteRandomSecret,clearRandomSecretKey } = require("./test_commons");

const createDriver = () => {
    const driver = {
        stubSecret: (secret) => process.env = Object.assign(process.env, secret),
        stubBrokenSecret: (secret) => {
            const { deletedKey, newSecret } = deleteRandomSecret(secret);
            process.env = Object.assign(process.env, newSecret);
            return { deletedKey, newSecret };
        },
        stubSecretWithEmptyField: (secret) => {
            const { clearedKey, newSecret } = clearRandomSecretKey(secret);
            process.env = Object.assign(process.env, newSecret);
            return { clearedKey, newSecret: secret };
        },
        restore: () => {
            delete process.env.HOST;
            delete process.env.USER;
            delete process.env.PASSWORD;
            delete process.env.CLOUD_SQL_CONNECTION_NAME;
            delete process.env.DB;
            delete process.env.SECRET_KEY;
        }
    };
    return driver;
}

const testHelper = () => {
    return {
        serviceFormat: (secret) => secret,
        secretClientFormat: (secret) => {
            const formatedSecret = lowercaseKeys(secret);
            formatedSecret.secretKey = formatedSecret.secret_key;
            delete formatedSecret.secret_key;
            return formatedSecret;
        }
    }
}

module.exports = { createDriver, testHelper }