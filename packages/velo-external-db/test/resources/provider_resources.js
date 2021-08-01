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
    schemaColumnTranslator: Uninitialized,
}

const dbInit = async (testEnv, impl) => {
    await testEnv.initEnv()

    const pool = testEnv.connection()
    const driver = impl.driver()

    env.connectionPool = pool
    env.dataProvider = new impl.DataProvider(pool, driver.filterParser)
    env.schemaProvider = new impl.SchemaProvider(pool)
    env.schemaColumnTranslator = new impl.SchemaColumnTranslator()
    env.driver = driver
}

const dbTeardown = async impl => {
    await env.connectionPool.end()
    await impl.shutdownEnv();

    env.dataProvider = Uninitialized
    env.schemaProvider = Uninitialized
    env.connectionPool = Uninitialized
    env.driver = Uninitialized
    env.schemaColumnTranslator = Uninitialized
}

const postgresTestEnvInit = async () => await dbInit(postgresTestEnv, postgres)
const mysqlTestEnvInit = async () => await dbInit(mysqlTestEnv, mysql)
const postgresTestEnvTeardown = async () => await dbTeardown(postgresTestEnv, postgres)
const mysqlTestEnvTeardown = async () => await dbTeardown(mysqlTestEnv, mysql)


module.exports = { env,
                   postgresTestEnvInit, postgresTestEnvTeardown,
                   mysqlTestEnvInit, mysqlTestEnvTeardown
}