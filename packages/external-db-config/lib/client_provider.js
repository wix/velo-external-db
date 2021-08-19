const { ExternalDbConfigClient } = require('./external_db_config_clients')
const { AwsSecretsProvider } = require('./service/aws_secrets_provider')
const { GcpSecretsProvider } = require('./service/gcp_secrets_provider')
const { SecretsProvider } = require('./service/secrets_provider')

const createExternalDbConfigClient = (vendor) => {
  // create impl from vendor
  // read config
  switch (vendor) {
    case 'aws':
      const awsSecretProvider = new AwsSecretsProvider()
      return new ExternalDbConfigClient(awsSecretProvider)
    case 'gcp':
      const gcpSecretProvider = new GcpSecretsProvider()
      return new ExternalDbConfigClient(gcpSecretProvider)
    case 'azr':
      const azrSecretsProvider = new SecretsProvider()
      return new ExternalDbConfigClient(azrSecretsProvider)
    default:
      return new ExternalDbConfigClient()
  }
}

module.exports = { createExternalDbConfigClient }
