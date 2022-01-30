const ConfigReader = require('./service/config_reader')
const CommonConfigReader = require('./readers/common_config_reader')
const StubConfigReader = require('./readers/stub_config_reader')
const aws = require('./readers/aws_config_reader')
const gcp = require('./readers/gcp_config_reader')
const azure = require('./readers/azure_config_reader')

const DefaultSecretId = 'VELO-EXTERNAL-DB-SECRETS'

const create = () => {
  const common = new CommonConfigReader()
  const { vendor = '', type, secretId, region } = common.readConfig()
  let internalConfigReader
  let internalAuthConfigReader

  switch (vendor.toLowerCase()) {
    case 'aws': {
      const { AwsAuthConfigReader } = require('./readers/aws_auth_config_reader')
      internalAuthConfigReader = new AwsAuthConfigReader(secretId || DefaultSecretId, region)

      switch(type) {
        case 'dynamodb':
          internalConfigReader = new aws.AwsDynamoConfigReader(region) 
          break
        default:
          internalConfigReader = new aws.AwsConfigReader(secretId || DefaultSecretId, region)
      }      
    
    }
    break
      
    case 'gcp': {
      const { GcpAuthConfigReader } = require('./readers/gcp_auth_config_reader')
      internalAuthConfigReader = new GcpAuthConfigReader()

      switch (type) {
        case 'spanner':
          internalConfigReader = new gcp.GcpSpannerConfigReader()
          break
        case 'firestore':
          internalConfigReader = new gcp.GcpFirestoreConfigReader()
          break
        case 'google-sheet':
          internalConfigReader = new gcp.GcpGoogleSheetsConfigReader()
          break
        case 'mongo':
          internalConfigReader = new gcp.GcpMongoConfigReader()
          break
        case 'airtable':
          internalConfigReader = new gcp.GcpAirtableConfigReader()  
          break
        case 'bigquery':
          internalConfigReader = new gcp.GcpBigQueryConfigReader()
          break
        case 'mysql':
        case 'postgres':
          internalConfigReader = new gcp.GcpConfigReader()
          break
      }
    }
    break

    case 'azure': {
      const { AzureAuthConfigReader } = require('./readers/azure_auth_config_reader')
      internalAuthConfigReader = new AzureAuthConfigReader()

      switch (type) {
        case 'spanner':
          internalConfigReader = new gcp.GcpSpannerConfigReader()
          break
        case 'firestore':
          internalConfigReader = new gcp.GcpFirestoreConfigReader()
          break
        case 'google-sheet':
          internalConfigReader = new gcp.GcpGoogleSheetsConfigReader()
          break
        case 'mongo':
          internalConfigReader = new gcp.GcpMongoConfigReader()
          break
        case 'airtable':
          internalConfigReader = new gcp.GcpAirtableConfigReader()
          break
        case 'dynamodb':
          internalConfigReader = new aws.AwsDynamoConfigReader(region) 
          break
        case 'bigquery':
          internalConfigReader = new gcp.GcpBigQueryConfigReader()
          break
        case 'mssql':
        case 'mysql':
        case 'postgres':
          internalConfigReader = new azure.AzureConfigReader()
          break
      }
    }
    break
  }

  return new ConfigReader(internalConfigReader || new StubConfigReader, common, internalAuthConfigReader || new StubConfigReader)
}

module.exports = { create }
