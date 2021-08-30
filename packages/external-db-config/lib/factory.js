const ExternalDbConfigClient = require('./service/external_db_config_client')
const { AwsConfigReader } = require('./readers/aws_config_reader')
const { GcpConfigReader, GcpSpannerConfigReader } = require('./readers/gcp_config_reader')
const { AzureConfigReader } = require('./readers/azr_config_reader')
const CommonConfigReader = require('./readers/common_config_reader')
const StubConfigReader = require('./readers/stub_config_reader')

const create = () => {
  const common = new CommonConfigReader()
  const { vendor, type } = common.readConfig()
  switch (vendor.toLowerCase()) {

    case 'aws':
        const awsConfigReader = new AwsConfigReader()
        return new ExternalDbConfigClient(awsConfigReader, common)

    case 'gcp':
      switch (type) {
        case 'spanner':
          const spannerConfigReader = new GcpSpannerConfigReader()
          return new ExternalDbConfigClient(spannerConfigReader, common)
        default:
          const gcpConfigReader = new GcpConfigReader()
          return new ExternalDbConfigClient(gcpConfigReader, common)
      }

    case 'azr':
      switch (type) {
        case 'spanner':
          const spannerConfigReader = new GcpSpannerConfigReader()
          return new ExternalDbConfigClient(spannerConfigReader, common)
        default:
          const azrSecretsProvider = new AzureConfigReader()
          return new ExternalDbConfigClient(azrSecretsProvider, common)
      }
    default:
      return new ExternalDbConfigClient(new StubConfigReader, common)
  }
}

module.exports = { create }
