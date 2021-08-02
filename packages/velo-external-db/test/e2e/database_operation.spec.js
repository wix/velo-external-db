const { AccessDeniedError, wrongDatabaseError, HostDoesNotExists } = require('velo-external-db-commons')
const { Uninitialized } = require('test-commons')
const mysql = require('mysql');
const each = require('jest-each').default;
const { Pool } = require('pg')
const { initApp, teardownApp, postgresTestEnvInit, dbTeardown, mysqlTestEnvInit } = require('../resources/e2e_resources')

const axios = require('axios').create({
    baseURL: 'http://localhost:8080' 
});
afterAll(async () => {
    await teardownApp()
}, 20000);

const mysqlConfig = () => {
    return {
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DB,
        host: process.env.HOST,
        waitForConnections: true,
        namedPlaceholders: true,
        multipleStatements: true,

        connectionLimit: 10,
        queueLimit: 0,
    }
}

const mysqlCreatePool = (config) => {
    return mysql.createPool(config)
}

const dbOperationGivenDBWithMisconfiguredPassword = (type, config) => {
    config['password'] = 'wrong'
    return dbOperationByType(type, createPool(type, config))
}
const dbOperationGivenDBWithMisconfiguredDatabase = (type, config) => {
    config['database'] = 'wrong'
    return dbOperationByType(type, createPool(type, config))
}
const dbOperationGivenDBWithMisconfiguredHost = (type, config) => {
    config['host'] = 'wrong'
    return dbOperationByType(type, createPool(type, config))
}
const dbOperationGivenValidDB = (type, config) => {
    return dbOperationByType(type, createPool(type, config))
}

const postgresConfig = () => {
    return {
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DB,
        host: process.env.HOST,
        port: 5432,

        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    }
}
const postgresCreatePool = (config) => {
    return new Pool(config)
}
const createPool = (type, config) => {
    switch (type) {
        case 'MySql':
            return mysqlCreatePool(config);
        case 'Postgres':
            return postgresCreatePool(config);
    }
}

const dbOperationByType = (type, pool) => {
    let requireDBOperations 
    switch (type) {
        case 'MySql':
            requireDBOperations='external-db-mysql'
            break;
        case 'Postgres':
            requireDBOperations='external-db-postgres'
            break;
    }
    const { DatabaseOperations } = require(requireDBOperations)
    return new DatabaseOperations(pool)

}


describe('Check Pool Connection', () => {
    each([
        ['MySql', mysqlConfig, mysqlTestEnvInit],
        ['Postgres', postgresConfig, postgresTestEnvInit],
    ]).describe('%s', (dbType, config, setup) => {

        beforeAll(async () => {
            await setup()

            initApp()
        }, 20000);

        afterAll(async () => {
            await dbTeardown()
        }, 20000);

        test('pool connection with wrong password will throw AccessDeniedError.', async () => {
            const dbOperation = dbOperationGivenDBWithMisconfiguredPassword(dbType, ctx.config)
            await expect(dbOperation.checkIfConnectionSucceeded()).rejects.toThrow(AccessDeniedError)
        })

        test('pool connection with wrong database will throw DatabaseDoesNotExists.', async () => {
            const dbOperation = dbOperationGivenDBWithMisconfiguredDatabase(dbType, ctx.config)
            await expect(dbOperation.checkIfConnectionSucceeded()).rejects.toThrow(wrongDatabaseError)
        })

        test('pool connection with wrong host will throw HostDoesNotExists.', async () => {
            const dbOperation = dbOperationGivenDBWithMisconfiguredHost(dbType, ctx.config)
            await expect(dbOperation.checkIfConnectionSucceeded()).rejects.toThrow(HostDoesNotExists)
        })
        test('pool connection with valid DB will not throw', async () => {
            const dbOperation = dbOperationGivenValidDB(dbType, ctx.config)
            await expect(dbOperation.checkIfConnectionSucceeded()).resolves.not.toThrow();
        })


        const ctx = {
            config: Uninitialized,
        }

        const env = {
        }

        beforeEach(function () {
            ctx.config = config()
        });
    })
})
