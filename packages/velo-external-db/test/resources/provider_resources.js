const {Uninitialized} = require('test-commons');
const postgresTestEnv = require('../resources/postgres_resources');
const mysqlTestEnv = require('../resources/mysql_resources');
const spannerTestEnv = require('../resources/spanner_resources');
const mysql = require('external-db-mysql')
const spanner = require('external-db-spanner')
const postgres = require('external-db-postgres')

const env = {
    dataProvider: Uninitialized,
    schemaProvider: Uninitialized,
    cleanup: Uninitialized,
    driver: Uninitialized,
}

const dbInit = async (testEnv, impl) => {
    await testEnv.cleanup()

    const {pool, cleanup} = testEnv.connection()
    const driver = impl.driver()

    env.dataProvider = new impl.DataProvider(pool, driver.filterParser)
    env.schemaProvider = new impl.SchemaProvider(pool)
    env.driver = driver
    env.cleanup = cleanup
}

const dbTeardown = async () => {
    await env.cleanup()
    env.dataProvider = Uninitialized
    env.schemaProvider = Uninitialized
    env.driver = Uninitialized
    env.schemaColumnTranslator = Uninitialized
}

const postgresTestEnvInit = async () => await dbInit(postgresTestEnv, postgres)
const mysqlTestEnvInit = async () => await dbInit(mysqlTestEnv, mysql)
const spannerTestEnvInit = async () => await dbInit(spannerTestEnv, spanner)

module.exports = { env,
                   postgresTestEnvInit, dbTeardown,
                   mysqlTestEnvInit,
                   spannerTestEnvInit,
}