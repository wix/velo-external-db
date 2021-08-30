const {Uninitialized, sleep} = require('test-commons')
const {authInit} = require("../drivers/auth_test_support")
const postgres = require("../resources/postgres_resources")
const mysql = require('../resources/mysql_resources')
const spanner = require('../resources/spanner_resources')
const firestore = require('../resources/firestore_resources')
const { waitUntil } = require('async-wait-until')

const env = {
    secretKey: Uninitialized,
    app: Uninitialized,
    internals: Uninitialized,
}

const initApp = async () => {
    process.env.CLOUD_VENDOR = 'azr'
    if (env.app) {
        await env.app.reload()
    } else {
        env.secretKey = authInit()
        env.internals = require('../..').internals

        await waitUntil(() => env.internals().started)
    }
    env.app = env.internals()
}

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
const spannerTestEnvInit = async () => await dbInit(spanner)
const firestoreTestEnvInit = async () => await dbInit(firestore)


module.exports = { env, initApp, teardownApp, dbTeardown,
                   postgresTestEnvInit,
                   mysqlTestEnvInit,
                   spannerTestEnvInit,
                   firestoreTestEnvInit,
}