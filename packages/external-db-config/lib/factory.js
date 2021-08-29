const ExternalDbConfigClient = require('./external_db_config_client')
const { AwsSecretProvider } = require('./providers/aws_secret_provider')
const { GcpSecretProvider } = require('./providers/gcp_secret_provider')
const { AzrSecretsProvider } = require('./providers/azr_secret_provider')

const create = (vendor) => {
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

module.exports = { create }
