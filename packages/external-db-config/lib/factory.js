const ConfigReader = require('./service/config_reader')
const CommonConfigReader = require('./readers/common_config_reader')
const StubConfigReader = require('./readers/stub_config_reader')
const AwsAuthorizationConfigReader = require ('./readers/aws_authorization_config_reader')
const AuthorizationConfigReader = require ('./readers/authorization_config_reader')
const aws = require('./readers/aws_config_reader')
const gcp = require('./readers/gcp_config_reader')
const azure = require('./readers/azure_config_reader')

const DefaultSecretId = 'VELO-EXTERNAL-DB-SECRETS'

const create = () => {
  const common = new CommonConfigReader()
  const { vendor = '', type, secretId, region } = common.readConfig()
  let internalConfigReader
  let authorizationConfigReader

  switch (vendor.toLowerCase()) {
    case 'aws': {
      authorizationConfigReader = new AwsAuthorizationConfigReader(region, secretId)
      switch(type) {
        case 'dynamodb':
          internalConfigReader = new aws.AwsDynamoConfigReader(region) 
          break
        case 'mongo':
          internalConfigReader = new aws.AwsMongoConfigReader(region, secretId)
          break
        default:
          internalConfigReader = new aws.AwsConfigReader(secretId || DefaultSecretId, region)
      }      
    
    }
    break
      
    case 'gcp': {
      authorizationConfigReader = new AuthorizationConfigReader()
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
      authorizationConfigReader = new AuthorizationConfigReader()
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

  return new ConfigReader(internalConfigReader || new StubConfigReader, common, authorizationConfigReader)
}

module.exports = { create }
