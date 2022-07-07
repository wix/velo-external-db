const { Uninitialized } = require('@wix-velo/test-commons')
const each = require('jest-each').default
const Chance = require('chance')
const chance = new Chance()
const gcpDriver = require('../drivers/gcp_mysql_config_test_support')
const gcpSpannerDriver = require('../drivers/gcp_spanner_config_test_support')
const gcpFirestoreDriver = require('../drivers/gcp_firestore_config_test_support')
const azureDriver = require('../drivers/gcp_mysql_config_test_support')
const awsDriver = require('../drivers/aws_mysql_config_test_support')
const awsMongoDriver = require('../drivers/aws_mongo_config_test_support')
const commonDriver = require('../drivers/common_config_test_support')

describe('External DB config client', () => {
  each([
    ['Vendor: GCP, DB: MySql/Postgres', gcpDriver],
    ['Vendor: GCP, DB: Spanner', gcpSpannerDriver],
    ['Vendor: GCP, DB: Firestore', gcpFirestoreDriver],
    ['Vendor: Azure, DB: MySql/Postgres', azureDriver],
    ['Vendor: AWS, DB: MySql/Postgres', awsDriver],
    ['Vendor: AWS, DB: Mongo', awsMongoDriver],
    ['Vendor: All, Common Config Reader', commonDriver],
  ]).describe('%s', (name, driver) => {

    beforeAll(async() => {
      driver.init?.()
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

    each(
        Object.keys(driver.validConfig())
    ).test('config will handle missing property [%s], by not returning it', async(p) => {
      delete ctx.config[p]
      driver.defineValidConfig(ctx.config)

      const expected = await env.configReaderProvider.readConfig()

      expect(expected[p]).toBeUndefined()
    })
    
    if (driver.hasReadErrors) {
      test('read config when part of the config from secret manager and other part from process.env', async() => {
        driver.defineSplittedConfig(ctx.config)

        const expected = await env.configReaderProvider.readConfig()

        expect(expected).toEqual(ctx.config)
      })
    }

    const ctx = {
      config: Uninitialized,
      error: Uninitialized,
    }

    const env = {
      configReaderProvider: Uninitialized
    }

    beforeEach(async() => {
      driver.reset()
      ctx.config = driver.validConfig()
      ctx.error = chance.word()
    })
  })
})
