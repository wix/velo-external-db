const { Uninitialized, gen } = require('test-commons')
const { env, externalDbConfigClientTestAzrInit,externalDbConfigClientTestAwsInit,externalDbConfigClientTestGcpInit,externalDbConfigClientTestNoVendorInit } = require('./resources/resources_provider')
const each = require('jest-each').default

describe('External DB config client', () => {
  each([
    ['Vendor: AZR', externalDbConfigClientTestAzrInit],
    ['Vendor: AWS', externalDbConfigClientTestAwsInit],
    ['Vendor: GCP', externalDbConfigClientTestGcpInit],
    ['Vendor: None', externalDbConfigClientTestNoVendorInit],
  ]).describe('%s', (name, setup) => {
    afterEach(() => {
      env.driver.restore()
    })

    beforeAll(async () => {
      await setup()
    })

    test('get secret with secret client', async () => {
      const secretInSecretService = env.testHelper.serviceFormat(ctx.secret)
      env.driver.stubSecret(secretInSecretService)
      const result = await env.externalDbConfigClient.readConfig()

      expect(result).toEqual(env.testHelper.externalDBClientFormat(secretInSecretService))
    })

    test('get secret without all the required fields', async () => {
      const secretInSecretService = env.testHelper.serviceFormat(ctx.secret)
      const { deletedKey, brokenSecret } = env.driver.stubBrokenSecret(secretInSecretService)
      const config = await env.externalDbConfigClient.readConfig()

      expect(config).toEqual(env.testHelper.externalDBClientFormat(brokenSecret))
      expect(env.externalDbConfigClient.missingRequiredSecretsKeys).toEqual([deletedKey])
    })

    test('get secret with a field that is empty', async () => {
      const secretInSecretService = env.testHelper.serviceFormat(ctx.secret)
      const { clearedKey, brokenSecret } = env.driver.stubSecretWithEmptyField(secretInSecretService)
      const config = await env.externalDbConfigClient.readConfig()

      expect(config).toEqual(env.testHelper.externalDBClientFormat(brokenSecret))
      expect(env.externalDbConfigClient.missingRequiredSecretsKeys).toEqual([clearedKey])
    })

    const ctx = {
      secret: Uninitialized
    }

    beforeEach(async () => {
      ctx.secret = gen.randomSecret()
    })
  })
})
