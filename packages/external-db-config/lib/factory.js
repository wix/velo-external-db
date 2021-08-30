const ConfigReader = require('./service/config_reader')
const AwsConfigReader = require('./readers/aws_config_reader')
const { GcpConfigReader, GcpSpannerConfigReader } = require('./readers/gcp_config_reader')
const AzureConfigReader = require('./readers/azure_config_reader')
const CommonConfigReader = require('./readers/common_config_reader')
const StubConfigReader = require('./readers/stub_config_reader')

const create = () => {
  const common = new CommonConfigReader()
  const { vendor, type } = common.readConfig()
  switch (vendor.toLowerCase()) {

    case 'aws':
        const awsConfigReader = new AwsConfigReader()
        return new ConfigReader(awsConfigReader, common)

    case 'gcp':
      switch (type) {
        case 'spanner':
          const spannerConfigReader = new GcpSpannerConfigReader()
          return new ConfigReader(spannerConfigReader, common)
        default:
          const gcpConfigReader = new GcpConfigReader()
          return new ConfigReader(gcpConfigReader, common)
      }

    case 'azr':
      switch (type) {
        case 'spanner':
          const spannerConfigReader = new GcpSpannerConfigReader()
          return new ConfigReader(spannerConfigReader, common)
        default:
          const azrSecretsProvider = new AzureConfigReader()
          return new ConfigReader(azrSecretsProvider, common)
      }
    default:
      return new ConfigReader(new StubConfigReader, common)
  }
}

module.exports = { create }
