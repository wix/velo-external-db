const {Uninitialized} = require("test-commons");
const {authInit} = require("../drivers/auth-test-support");
const postgres = require("../resources/postgres_resources");
const mysql = require("../resources/mysql_resources");

const env = {
    secretKey: Uninitialized,
    app: Uninitialized,
}

const initApp = () => {
    authInit()
    if (env.app) {
        env.app.load()
    }
    env.app = require('../..')
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const teardownApp = async () => {
    await sleep(500)
    await env.app.server.close()
}

const dbInit = async impl => {
    await impl.initEnv()
    impl.setActive()
}

const dbTeardown = async impl => {
    await env.app.cleanup()

    await impl.shutdownEnv()
}

const postgresTestEnvInit = async () => await dbInit(postgres)
const mysqlTestEnvInit = async () => await dbInit(mysql)
const mysqlTestEnvTeardown = async () => await dbTeardown(mysql)
const postgresTestEnvTeardown = async () => await dbTeardown(postgres)



module.exports = { env, initApp, teardownApp,
                   postgresTestEnvInit, postgresTestEnvTeardown,
                   mysqlTestEnvInit, mysqlTestEnvTeardown
}