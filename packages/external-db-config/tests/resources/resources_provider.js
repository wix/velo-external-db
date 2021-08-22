const { Uninitialized } = require('test-commons')
const { createExternalDbConfigClient } = require('../../lib/client_provider')
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
  env.externalDbConfigClient = createExternalDbConfigClient(vendor)
  env.driver = testEnv.createDriver()
  env.testHelper = testEnv.testHelper
}


const externalDbClientTestAzrInit = async () => await externalDbConfigInit('azr', externalDbConfigAzrTestEnv)
const externalDbClientTestAwsInit = async () => await externalDbConfigInit('aws', externalDbConfigAwsTestEnv)
const externalDbClientTestGcpInit = async () => await externalDbConfigInit('gcp', externalDbConfigGcpTestEnv)
const externalDbClientTestNoVendorInit = async () => await externalDbConfigInit('', externalDbConfigNoVendorEnv)

module.exports = {
  env,
  externalDbClientTestAzrInit,
  externalDbClientTestAwsInit,
  externalDbClientTestGcpInit,
  externalDbClientTestNoVendorInit
}
