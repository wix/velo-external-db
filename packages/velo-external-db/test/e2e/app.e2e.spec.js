const { auth } = require('../drivers/auth_test_support')
const each = require('jest-each').default
const { mysqlTestEnvInit, dbTeardown, postgresTestEnvInit, initApp, teardownApp} = require("../resources/e2e_resources")

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
});

describe('Velo External DB',  () => {
    each([
        ['MySql', mysqlTestEnvInit],
        ['Postgres', postgresTestEnvInit],
    ]).describe('%s', (name, setup, teardown) => {
        beforeAll(async () => {
            jest.resetModules()

            await setup()

            await initApp()
        }, 20000);

        afterAll(async () => {
            await dbTeardown()
            await teardownApp()

        }, 20000);


        test('answer default page with a welcoming response', async () => {
            expect((await axios.get(`/`)).data).toContain('<!doctype html>');
        })

        test('answer provision with stub response', async () => {
            expect((await axios.post(`/provision`, {}, auth)).data).toEqual({});
        })
    })

})
