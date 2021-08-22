const { ExternalDbConfigClient } = require('./external_db_config_clients')
const { AwsSecretProvider } = require('./services/aws_secret_provider')
const { GcpSecretProvider } = require('./services/gcp_secret_provider')
const { AzrSecretsProvider } = require('./services/azr_secret_provider')

const createExternalDbConfigClient = (vendor) => {
  switch (vendor) {
    case 'aws':
      const awsSecretProvider = new AwsSecretProvider()
      return new ExternalDbConfigClient(awsSecretProvider)
    case 'gcp':
      const gcpSecretProvider = new GcpSecretProvider()
      return new ExternalDbConfigClient(gcpSecretProvider)
    case 'azr':
      const azrSecretsProvider = new AzrSecretsProvider()
      return new ExternalDbConfigClient(azrSecretsProvider)
    default:
      return new ExternalDbConfigClient()
  }
}

module.exports = { createExternalDbConfigClient }
