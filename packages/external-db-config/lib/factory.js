const ExternalDbConfigClient = require('./service/external_db_config_client')
const { AwsSecretProvider } = require('./readers/aws_secret_provider')
const { GcpSecretProvider, GcpSpannerConfigProvider } = require('./readers/gcp_secret_provider')
const { AzrSecretsProvider } = require('./readers/azr_secret_provider')
const CommonConfigReader = require('./readers/common_config_reader')
const StubSecretProvider = require('./readers/stub_secret_provider')

const create = () => {
  const common = new CommonConfigReader()
  const { vendor, type } = common.getSecrets()
  switch (vendor.toLowerCase()) {

    case 'aws':
        const awsSecretProvider = new AwsSecretProvider()
        return new ExternalDbConfigClient(awsSecretProvider, common)

    case 'gcp':
      switch (type) {
        case 'spanner':
          const spannerSecretProvider = new GcpSpannerConfigProvider()
          return new ExternalDbConfigClient(spannerSecretProvider, common)
        default:
          const gcpSecretProvider = new GcpSecretProvider()
          return new ExternalDbConfigClient(gcpSecretProvider, common)
      }

    case 'azr':
      switch (type) {
        case 'spanner':
          const spannerSecretProvider = new GcpSpannerConfigProvider()
          return new ExternalDbConfigClient(spannerSecretProvider, common)
        default:
          const azrSecretsProvider = new AzrSecretsProvider()
          return new ExternalDbConfigClient(azrSecretsProvider, common)
      }
    default:
      return new ExternalDbConfigClient(new StubSecretProvider, common)
  }
}

module.exports = { create }
