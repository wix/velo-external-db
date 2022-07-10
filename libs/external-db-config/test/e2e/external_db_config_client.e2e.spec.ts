import { Uninitialized } from '@wix-velo/test-commons'
import { env, initEnv, reset } from '../drivers/external_config_reader_e2e_test_support'
const each = require('jest-each').default

each(
[
       ['AZURE', ['mysql', 'postgres']],
       ['AWS', ['mysql', 'postgres', 'mongo']],
       ['GCP', ['mysql', 'postgres', 'spanner', 'firestore']]
      ]
).describe('Config Reader for %s', (vendor: string, engines: string) => {

    each(engines).describe('Engine %s', (engine: string) => {

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
    })

})

