const {Uninitialized} = require("test-commons")
const {authInit} = require("../drivers/auth_test_support")
const postgres = require("../resources/postgres_resources")
const mysql = require('../resources/mysql_resources')
const { waitUntil } = require('async-wait-until')

const env = {
    secretKey: Uninitialized,
    app: Uninitialized,
    internals: Uninitialized,
}

const initApp = async () => {
    if (env.app) {
        await env.app.load()
        env.app = env.internals()
    } else {
        env.secretKey = authInit()
        const { internals } = require('../..')

        await waitUntil(() => {
            const { started } = internals()
            return started
        });

        env.app = internals()
        env.internals = internals
    }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const teardownApp = async () => {
    await sleep(500)
    await env.app.server.close()
}

const dbInit = async impl => {
    await impl.cleanup()
    impl.setActive()
}

const dbTeardown = async () => {
    await env.app.cleanup()
}

const postgresTestEnvInit = async () => await dbInit(postgres)
const mysqlTestEnvInit = async () => await dbInit(mysql)


module.exports = { env, initApp, teardownApp, dbTeardown,
                   postgresTestEnvInit,
                   mysqlTestEnvInit
}