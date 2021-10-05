const ConfigReader = require('./service/config_reader')
const CommonConfigReader = require('./readers/common_config_reader')
const StubConfigReader = require('./readers/stub_config_reader')
const aws = require('./readers/aws_config_reader')
const gcp = require('./readers/gcp_config_reader')
const azure = require('./readers/azure_config_reader')

const DefaultSecretId = 'VELO-EXTERNAL-DB-SECRETS'

const create = () => {
  const common = new CommonConfigReader()
  const { vendor, type, secretId } = common.readConfig()
  let internalConfigReader
  switch (vendor.toLowerCase()) {

    case 'aws':
      internalConfigReader = new aws.AwsConfigReader(secretId || DefaultSecretId)
      break;

    case 'gcp':
      switch (type) {
        case 'spanner':
          internalConfigReader = new gcp.GcpSpannerConfigReader()
          break;
        case 'firestore':
          internalConfigReader = new gcp.GcpFirestoreConfigReader()
          break;
        case 'google-sheet':
          internalConfigReader = new gcp.GcpGoogleSheetsConfigReader()
          break;
        case 'mysql':
        case 'postgres':
        case 'mongo':
          internalConfigReader = new gcp.GcpConfigReader()
          break;
      }
      break

    case 'azr':
      switch (type) {
        case 'spanner':
          internalConfigReader = new gcp.GcpSpannerConfigReader()
          break
        case 'firestore':
          internalConfigReader = new gcp.GcpFirestoreConfigReader()
          break

        case 'mssql':
        case 'mysql':
        case 'postgres':
        case 'mongo':
          internalConfigReader = new azure.AzureConfigReader()
          break;
      }
      break
  }

  return new ConfigReader(internalConfigReader || new StubConfigReader, common)
}

module.exports = { create }
