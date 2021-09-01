const ConfigReader = require('./service/config_reader')
const AwsConfigReader = require('./readers/aws_config_reader')
const { GcpConfigReader, GcpSpannerConfigReader, GcpFirestoreConfigReader } = require('./readers/gcp_config_reader')
const AzureConfigReader = require('./readers/azure_config_reader')
const CommonConfigReader = require('./readers/common_config_reader')
const StubConfigReader = require('./readers/stub_config_reader')

const create = () => {
  const common = new CommonConfigReader()
  const { vendor, type } = common.readConfig()
  let internalConfigReader
  switch (vendor.toLowerCase()) {

    case 'aws':
      internalConfigReader = new AwsConfigReader()
      break;

    case 'gcp':
      switch (type) {
        case 'spanner':
          internalConfigReader = new GcpSpannerConfigReader()
          break;
        case 'firestore':
          internalConfigReader = new GcpFirestoreConfigReader()
          break;
        case 'mysql':
        case 'postgres':
          internalConfigReader = new GcpConfigReader()
          break;
      }
      break

    case 'azr':
      switch (type) {
        case 'spanner':
          internalConfigReader = new GcpSpannerConfigReader()
          break;

        case 'mssql':
        case 'mysql':
        case 'postgres':
          internalConfigReader = new AzureConfigReader()
          break;
      }
      break
  }

  return new ConfigReader(internalConfigReader || new StubConfigReader, common)
}

module.exports = { create }
