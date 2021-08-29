const { Uninitialized } = require('test-commons')
const { create } = require('../../lib/factory')
const externalDbConfigAwsTestEnv = require('./aws_external_db_config_resources')
const externalDbConfigAzrTestEnv = require('./azr_external_db_config_resources')
const externalDbConfigGcpTestEnv = require('./gcp_external_db_config_resources')
const externalDbConfigNoVendorEnv = require('./no_vendor_external_db_config_resources');

const env = {
  externalDbConfigClient: Uninitialized,
  driver: Uninitialized,
  testHelper: Uninitialized
}

const externalDbConfigInit = async (vendor, testEnv) => {
  env.externalDbConfigClient = create(vendor)
  env.driver = testEnv.createDriver()
  env.testHelper = testEnv.testHelper
  process.env.TYPE = 'mysql'
}


const externalDbConfigClientTestAzrInit = async () => await externalDbConfigInit('azr', externalDbConfigAzrTestEnv)
const externalDbConfigClientTestAwsInit = async () => await externalDbConfigInit('aws', externalDbConfigAwsTestEnv)
const externalDbConfigClientTestGcpInit = async () => await externalDbConfigInit('gcp', externalDbConfigGcpTestEnv)
const externalDbConfigClientTestNoVendorInit = async () => await externalDbConfigInit('', externalDbConfigNoVendorEnv)

module.exports = {
  env,
  externalDbConfigClientTestAzrInit,
  externalDbConfigClientTestAwsInit,
  externalDbConfigClientTestGcpInit,
  externalDbConfigClientTestNoVendorInit
}
