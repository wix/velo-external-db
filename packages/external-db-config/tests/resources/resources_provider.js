const { Uninitialized } = require('test-commons')

const { ExternalDbConfigClient } = require('../../lib/external_db_config_clients')
const { AwsSecretsProvider } = require('../../lib/service/aws_secrets_provider')
const { GcpSecretsProvider } = require('../../lib/service/gcp_secrets_provider')
const { SecretsProvider } = require('../../lib/service/secrets_provider')

const secretMangerAwsTestEnv = require('./aws_external_db_config_resources')
const secretMangerTestEnv = require('./external_db_config_resources')
const secretMangerGCPTestEnv = require('./gcp_external_db_config_resources')

const env = {
  secretClientProvider: Uninitialized,
  externalDbConfigClient : Uninitialized,
  driver: Uninitialized,
  testHelper: Uninitialized
}

const secretMangerInit = async (Impl, testEnv) => {
  const secretClientProvider = new Impl()
  env.secretClientProvider = secretClientProvider
  env.externalDbConfigClient = new ExternalDbConfigClient(secretClientProvider)
  env.driver = testEnv.createDriver()
  env.testHelper = testEnv.testHelper()
}

const secretMangerTestEnvInit = async () => await secretMangerInit(SecretsProvider, secretMangerTestEnv)
const secretMangerTestAWSEnvInit = async () => await secretMangerInit(AwsSecretsProvider, secretMangerAwsTestEnv)
const secretMangerTestGCPEnvInit = async () => await secretMangerInit(GcpSecretsProvider, secretMangerGCPTestEnv)

module.exports = {
  env,
  secretMangerTestEnvInit,
  secretMangerTestAWSEnvInit,
  secretMangerTestGCPEnvInit
}
