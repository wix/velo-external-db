const { Uninitialized } = require('test-commons')
const each = require('jest-each').default
const Chance = require('chance')
const chance = new Chance()
const gcpDriver = require('../drivers/gcp_mysql_config_test_support')
const gcpSpannerDriver = require('../drivers/gcp_spanner_config_test_support')
const gcpFirestoreDriver = require('../drivers/gcp_firestore_config_test_support')
const azureDriver = require('../drivers/gcp_mysql_config_test_support')
const awsDriver = require('../drivers/aws_mysql_config_test_support')
const commonDriver = require('../drivers/common_config_test_support')

describe('External DB config client', () => {
  each([
    ['Vendor: GCP, DB: MySql/Postgres', gcpDriver],
    ['Vendor: GCP, DB: Spanner', gcpSpannerDriver],
    ['Vendor: GCP, DB: Firestore', gcpFirestoreDriver],
    ['Vendor: Azure, DB: MySql/Postgres', azureDriver],
    ['Vendor: AWS, DB: MySql/Postgres', awsDriver],
    ['Vendor: All, Common Config Reader', commonDriver],
  ]).describe('%s', (name, driver) => {

    beforeAll(async() => {
      env.configReaderProvider = driver.configReaderProvider
    })

    afterEach(() => {
      driver.reset()
    })

    test('read config when config is defined', async() => {
      driver.defineValidConfig(ctx.config)

      const expected = await env.configReaderProvider.readConfig()

      expect(expected).toEqual(ctx.config)
    })

    test('read empty/default config when config is broken', async() => {
      if (driver.hasReadErrors) {
        driver.defineErroneousConfig()

        const expected = await env.configReaderProvider.readConfig()

        expect(expected).toEqual(driver.defaultConfig)
      }
    })

    each(
        Object.keys(driver.validConfig())
    ).test('config will handle missing property [%s], by not returning it', async(p) => {
      delete ctx.config[p]
      driver.defineValidConfig(ctx.config)

      const expected = await env.configReaderProvider.readConfig()

      expect(expected[p]).toBeUndefined()
    })

    each(
        Object.keys(driver.validConfig())
              .map((v, i) => [driver.ExpectedProperties[i], v])
    ).test('validate will detect missing property [%s]', async(s, p) => {
      delete ctx.config[p]
      driver.defineValidConfig(ctx.config)

      const expected = await env.configReaderProvider.validate()

      expect(expected).toMatchObject({ missingRequiredSecretsKeys: [s] })
    })

    test('validate will detect config read errors', async() => {
      if (driver.hasReadErrors) {
        driver.defineErroneousConfig(ctx.error)

        const expected = await env.configReaderProvider.validate()

        expect(expected).toEqual({ configReadError: ctx.error, missingRequiredSecretsKeys: [] })
      }
    })

    const ctx = {
      config: Uninitialized,
      error: Uninitialized,
    }

    const env = {
      configReaderProvider: Uninitialized
    }

    beforeEach(async() => {
      ctx.config = driver.validConfig()
      ctx.error = chance.word()
    })
  })
})
