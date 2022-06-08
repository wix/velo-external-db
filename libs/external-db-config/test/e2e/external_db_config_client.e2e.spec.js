const { Uninitialized } = require('@wix-velo/test-commons')
const { env, initEnv, reset } = require('../drivers/external_config_reader_e2e_test_support')
const each = require('jest-each').default
const { invalidConfigStatusResponse } = require('./external_db_config_client_matcher')

each(
[
       ['AZURE', ['mysql', 'postgres']],
       ['AWS', ['mysql', 'postgres', 'mongo']],
       ['GCP', ['mysql', 'postgres', 'spanner', 'firestore']]
      ]
).describe('Config Reader for %s', (vendor, engines) => {

    each(engines).describe('Engine %s', (engine) => {

        beforeAll(async() => {
            initEnv(vendor, engine)
        })

        const ctx = {
            config: Uninitialized
        }

        beforeEach(async() => {
            reset()
            ctx.config = env.driver.validConfigWithAuthorization()
        })


        test('read config', async() => {
            env.driver.defineValidConfig(ctx.config)

            await expect( env.configReader.readConfig() ).resolves.toEqual(ctx.config)
        })

        test('validate config', async() => {
            env.driver.defineInvalidConfig()

            await expect( env.configReader.configStatus() ).resolves.toEqual( invalidConfigStatusResponse() )
        })

    })

})

