const { Uninitialized, gen } = require('test-commons')
const { env, secretMangerTestEnvInit, secretMangerTestAWSEnvInit, secretMangerTestGCPEnvInit } = require('./resources/resources_provider')
const each = require('jest-each').default

describe('SECRET MANGER', () => {
  each([
    ['ENV', secretMangerTestEnvInit],
    ['AWS', secretMangerTestAWSEnvInit],
    ['GCP', secretMangerTestGCPEnvInit]
  ]).describe('%s', (name, setup) => {
    afterEach(() => {
      env.driver.restore()
    })

    beforeAll(async () => {
      await setup()
    }, 20000)

    test('get secret with secret client', async () => {
      env.driver.stubSecret(env.testHelper.serviceFormat(ctx.secret))
      const result = await env.externalDbConfigClient.readConfig()
      expect(result).toEqual(env.testHelper.secretClientFormat(ctx.secret))
    })

    test('get secret without all the required fields', async () => {
      const secret = env.testHelper.serviceFormat(ctx.secret)
      const { deletedKey } = env.driver.stubBrokenSecret(secret)
      await env.externalDbConfigClient.readConfig()
      expect(env.externalDbConfigClient.missingRequiredSecretsKeys).toEqual([deletedKey.toLowerCase()])
    })

    test('get secret with a field that is empty', async () => {
      const secret = env.testHelper.serviceFormat(ctx.secret)
      const { newSecret } = env.driver.stubSecretWithEmptyField(secret)
      const brokenSecret = env.testHelper.secretClientFormat(newSecret)
      const config = await env.externalDbConfigClient.readConfig()
      expect(config).toEqual(brokenSecret)
    })

    const ctx = {
      secret: Uninitialized
    }

    beforeEach(async () => {
      ctx.secret = gen.randomSecret()
    })
  })
})
