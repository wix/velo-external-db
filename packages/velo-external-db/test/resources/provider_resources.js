const {Uninitialized} = require('test-commons');
const postgresTestEnv = require('../resources/postgres_resources');
const mysqlTestEnv = require('../resources/mysql_resources');
const mysql = require('external-db-mysql')
const postgres = require('external-db-postgres')

const env = {
    dataProvider: Uninitialized,
    schemaProvider: Uninitialized,
    connectionPool: Uninitialized,
    driver: Uninitialized,
}

const dbInit = async (testEnv, impl) => {
    await testEnv.cleanup()

    const pool = testEnv.connection()
    const driver = impl.driver()

    env.connectionPool = pool
    env.dataProvider = new impl.DataProvider(pool, driver.filterParser)
    env.schemaProvider = new impl.SchemaProvider(pool)
    env.driver = driver
}

const dbTeardown = async () => {
    await env.connectionPool.end(/*() => {}*/)
    env.dataProvider = Uninitialized
    env.schemaProvider = Uninitialized
    env.connectionPool = Uninitialized
    env.driver = Uninitialized
    env.schemaColumnTranslator = Uninitialized
}

const postgresTestEnvInit = async () => await dbInit(postgresTestEnv, postgres)
const mysqlTestEnvInit = async () => await dbInit(mysqlTestEnv, mysql)

module.exports = { env,
                   postgresTestEnvInit, dbTeardown,
                   mysqlTestEnvInit,
}