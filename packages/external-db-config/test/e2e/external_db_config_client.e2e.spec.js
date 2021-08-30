const { Uninitialized } = require('test-commons')
const { env, initEnv, reset } = require('../drivers/external_config_reader_e2e_test_support')
const each = require('jest-each').default

each(
[['AZR', ['mysql', 'postgres']],
       ['AWS', ['mysql', 'postgres']],
       ['GCP', ['mysql', 'postgres', 'spanner']]
      ]
).describe('Config Reader for %s', (vendor, engines) => {

    each(engines).describe('Engine %s', (engine) => {

        beforeAll(async () => {
            initEnv(vendor, engine)
        })

        const ctx = {
            config: Uninitialized
        }

        beforeEach(async () => {
            reset()
            ctx.config = env.driver.validConfig()
        })


        test('read config', async () => {
            env.driver.defineValidConfig(ctx.config)

            const actual = await env.configReader.readConfig()

            expect(actual).toEqual(ctx.config)
        })

        test('validate config', async () => {
            env.driver.defineValidConfig({})

            const actual = await env.configReader.configStatus()

            expect(actual).toContain('Missing props:')
        })

    })

})

